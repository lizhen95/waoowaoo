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

// 删除全局道具
export const DELETE = apiHandler(async (request: NextRequest) => {
  // 🔐 统一权限验证
  const authResult = await requireUserAuth()
  if (isErrorResponse(authResult)) return authResult
  const { session } = authResult

  const { searchParams } = new URL(request.url)
  const propId = searchParams.get('id')

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

  // 删除道具（GlobalPropImage 会级联删除）
  await prisma.globalProp.delete({
    where: { id: propId }
  })

  return NextResponse.json({ success: true })
})

// 新增全局道具
export const POST = apiHandler(async (request: NextRequest) => {
  // 🔐 统一权限验证
  const authResult = await requireUserAuth()
  if (isErrorResponse(authResult)) return authResult
  const { session } = authResult

  const rawBody = await request.json().catch(() => ({}))
  const body = toObject(rawBody)
  const name = normalizeString(body.name)
  const category = normalizeString(body.category) || 'other'
  const description = normalizeString(body.description)
  const folderId = normalizeString(body.folderId)

  if (!name) {
    throw new ApiError('INVALID_PARAMS')
  }

  // 验证分类
  const validCategories = ['weapon', 'clothing', 'furniture', 'food', 'vehicle', 'tool', 'decoration', 'electronic', 'nature', 'other']
  if (!validCategories.includes(category)) {
    throw new ApiError('INVALID_PARAMS', {
      code: 'INVALID_CATEGORY',
      message: 'category must be one of the supported values'
    })
  }

  // 创建道具
  const prop = await prisma.globalProp.create({
    data: {
      userId: session.user.id,
      name,
      category,
      description: description || null,
      folderId: folderId || null
    }
  })

  return NextResponse.json(prop)
})

// 获取全局道具列表
export const GET = apiHandler(async (request: NextRequest) => {
  // 🔐 统一权限验证
  const authResult = await requireUserAuth()
  if (isErrorResponse(authResult)) return authResult
  const { session } = authResult

  const { searchParams } = new URL(request.url)
  const folderId = searchParams.get('folderId')

  const where: Record<string, unknown> = { userId: session.user.id }
  if (folderId) {
    where.folderId = folderId
  } else {
    where.folderId = null
  }

  const props = await prisma.globalProp.findMany({
    where,
    include: {
      images: {
        orderBy: { imageIndex: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(props)
})

// 更新全局道具信息
export const PATCH = apiHandler(async (request: NextRequest) => {
  // 🔐 统一权限验证
  const authResult = await requireUserAuth()
  if (isErrorResponse(authResult)) return authResult
  const { session } = authResult

  const body = await request.json()
  const { propId, name, category, description, folderId } = body

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

  if (!name && !category && description === undefined && folderId === undefined) {
    throw new ApiError('INVALID_PARAMS')
  }

  // 构建更新数据
  const updateData: { name?: string; category?: string; description?: string | null; folderId?: string | null } = {}
  if (name) updateData.name = name.trim()
  if (category) {
    const validCategories = ['weapon', 'clothing', 'furniture', 'food', 'vehicle', 'tool', 'decoration', 'electronic', 'nature', 'other']
    if (!validCategories.includes(category)) {
      throw new ApiError('INVALID_PARAMS', {
        code: 'INVALID_CATEGORY',
        message: 'category must be one of the supported values'
      })
    }
    updateData.category = category
  }
  if (description !== undefined) updateData.description = description ? description.trim() : null
  if (folderId !== undefined) updateData.folderId = folderId || null

  const updatedProp = await prisma.globalProp.update({
    where: { id: propId },
    data: updateData,
    include: {
      images: {
        orderBy: { imageIndex: 'asc' }
      }
    }
  })

  return NextResponse.json(updatedProp)
})
