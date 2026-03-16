import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireProjectAuth, requireProjectAuthLight, isErrorResponse } from '@/lib/api-auth'
import { apiHandler, ApiError } from '@/lib/api-errors'

function toObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

// 删除道具（级联删除关联的图片记录）
export const DELETE = apiHandler(async (
  request: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) => {
  const { projectId } = await context.params

  // 🔐 统一权限验证
  const authResult = await requireProjectAuthLight(projectId)
  if (isErrorResponse(authResult)) return authResult

  const { searchParams } = new URL(request.url)
  const propId = searchParams.get('id')

  if (!propId) {
    throw new ApiError('INVALID_PARAMS')
  }

  // 删除道具（NovelPromotionPropImage 会级联删除）
  await prisma.novelPromotionProp.delete({
    where: { id: propId }
  })

  return NextResponse.json({ success: true })
})

// 新增道具
export const POST = apiHandler(async (
  request: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) => {
  const { projectId } = await context.params

  // 🔐 统一权限验证
  const authResult = await requireProjectAuth(projectId)
  if (isErrorResponse(authResult)) return authResult
  const { novelData } = authResult

  const rawBody = await request.json().catch(() => ({}))
  const body = toObject(rawBody)
  const name = normalizeString(body.name)
  const category = normalizeString(body.category) || 'other'
  const description = normalizeString(body.description)

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
  const prop = await prisma.novelPromotionProp.create({
    data: {
      novelPromotionProjectId: novelData.id,
      name,
      category,
      description: description || null
    }
  })

  return NextResponse.json(prop)
})

// 获取道具列表
export const GET = apiHandler(async (
  request: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) => {
  const { projectId } = await context.params

  // 🔐 统一权限验证
  const authResult = await requireProjectAuthLight(projectId)
  if (isErrorResponse(authResult)) return authResult

  const novelData = await prisma.novelPromotionProject.findUnique({
    where: { projectId }
  })

  if (!novelData) {
    throw new ApiError('NOT_FOUND')
  }

  const props = await prisma.novelPromotionProp.findMany({
    where: {
      novelPromotionProjectId: novelData.id
    },
    include: {
      images: {
        orderBy: { imageIndex: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(props)
})

// 更新道具信息（名字、分类或描述）
export const PATCH = apiHandler(async (
  request: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) => {
  const { projectId } = await context.params

  // 🔐 统一权限验证
  const authResult = await requireProjectAuthLight(projectId)
  if (isErrorResponse(authResult)) return authResult

  const body = await request.json()
  const { propId, name, category, description } = body

  if (!propId) {
    throw new ApiError('INVALID_PARAMS')
  }

  if (!name && !category && description === undefined) {
    throw new ApiError('INVALID_PARAMS')
  }

  // 构建更新数据
  const updateData: { name?: string; category?: string; description?: string | null } = {}
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

  const prop = await prisma.novelPromotionProp.update({
    where: { id: propId },
    data: updateData,
    include: {
      images: {
        orderBy: { imageIndex: 'asc' }
      }
    }
  })

  return NextResponse.json(prop)
})
