import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUserAuth, isErrorResponse } from '@/lib/api-auth'
import { apiHandler, ApiError } from '@/lib/api-errors'

function toObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

// 删除全局道具图片
export const DELETE = apiHandler(async (request: NextRequest) => {
  // 🔐 统一权限验证
  const authResult = await requireUserAuth()
  if (isErrorResponse(authResult)) return authResult
  const { session } = authResult

  const { searchParams } = new URL(request.url)
  const imageId = searchParams.get('id')

  if (!imageId) {
    throw new ApiError('INVALID_PARAMS')
  }

  // 验证所有权
  const image = await prisma.globalPropImage.findUnique({
    where: { id: imageId },
    include: { prop: true }
  })

  if (!image || image.prop.userId !== session.user.id) {
    throw new ApiError('FORBIDDEN')
  }

  // 删除图片
  await prisma.globalPropImage.delete({
    where: { id: imageId }
  })

  return NextResponse.json({ success: true })
})

// 新增全局道具图片
export const POST = apiHandler(async (request: NextRequest) => {
  // 🔐 统一权限验证
  const authResult = await requireUserAuth()
  if (isErrorResponse(authResult)) return authResult
  const { session } = authResult

  const rawBody = await request.json().catch(() => ({}))
  const body = toObject(rawBody)
  const propId = normalizeString(body.propId)
  const imageUrl = normalizeString(body.imageUrl)
  const description = normalizeString(body.description)
  const imageMediaId = normalizeString(body.imageMediaId)

  if (!propId || !imageUrl) {
    throw new ApiError('INVALID_PARAMS')
  }

  // 验证所有权
  const prop = await prisma.globalProp.findUnique({
    where: { id: propId }
  })

  if (!prop || prop.userId !== session.user.id) {
    throw new ApiError('FORBIDDEN')
  }

  // 获取最大的imageIndex
  const maxImage = await prisma.globalPropImage.findFirst({
    where: { propId },
    orderBy: { imageIndex: 'desc' },
    select: { imageIndex: true }
  })

  const imageIndex = (maxImage?.imageIndex ?? -1) + 1

  // 创建图片
  const image = await prisma.globalPropImage.create({
    data: {
      propId,
      imageIndex,
      imageUrl,
      description: description || null,
      imageMediaId: imageMediaId || null
    }
  })

  return NextResponse.json(image)
})

// 获取全局道具的所有图片
export const GET = apiHandler(async (request: NextRequest) => {
  // 🔐 统一权限验证
  const authResult = await requireUserAuth()
  if (isErrorResponse(authResult)) return authResult
  const { session } = authResult

  const { searchParams } = new URL(request.url)
  const propId = searchParams.get('propId')

  if (!propId) {
    throw new ApiError('INVALID_PARAMS')
  }

  // 验证所有权
  const prop = await prisma.globalProp.findUnique({
    where: { id: propId }
  })

  if (!prop || prop.userId !== session.user.id) {
    throw new ApiError('FORBIDDEN')
  }

  const images = await prisma.globalPropImage.findMany({
    where: { propId },
    orderBy: { imageIndex: 'asc' }
  })

  return NextResponse.json(images)
})

// 更新全局道具图片
export const PATCH = apiHandler(async (request: NextRequest) => {
  // 🔐 统一权限验证
  const authResult = await requireUserAuth()
  if (isErrorResponse(authResult)) return authResult
  const { session } = authResult

  const body = await request.json()
  const { imageId, imageUrl, description, isSelected, imageMediaId } = body

  if (!imageId) {
    throw new ApiError('INVALID_PARAMS')
  }

  // 验证所有权
  const image = await prisma.globalPropImage.findUnique({
    where: { id: imageId },
    include: { prop: true }
  })

  if (!image || image.prop.userId !== session.user.id) {
    throw new ApiError('FORBIDDEN')
  }

  // 构建更新数据
  const updateData: { imageUrl?: string; description?: string | null; isSelected?: boolean; imageMediaId?: string | null } = {}
  if (imageUrl) updateData.imageUrl = imageUrl.trim()
  if (description !== undefined) updateData.description = description ? description.trim() : null
  if (isSelected !== undefined) updateData.isSelected = isSelected
  if (imageMediaId !== undefined) updateData.imageMediaId = imageMediaId || null

  const updatedImage = await prisma.globalPropImage.update({
    where: { id: imageId },
    data: updateData
  })

  return NextResponse.json(updatedImage)
})
