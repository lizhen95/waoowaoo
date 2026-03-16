import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireProjectAuth, isErrorResponse } from '@/lib/api-auth'
import { apiHandler, ApiError } from '@/lib/api-errors'

// 从全局道具复制到项目
export const POST = apiHandler(async (
  request: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) => {
  const { projectId } = await context.params

  // 🔐 统一权限验证
  const authResult = await requireProjectAuth(projectId)
  if (isErrorResponse(authResult)) return authResult
  const { novelData } = authResult

  const body = await request.json()
  const { globalPropId } = body

  if (!globalPropId) {
    throw new ApiError('INVALID_PARAMS')
  }

  // 获取全局道具及其图片
  const globalProp = await prisma.globalProp.findUnique({
    where: { id: globalPropId },
    include: {
      images: {
        orderBy: { imageIndex: 'asc' }
      }
    }
  })

  if (!globalProp) {
    throw new ApiError('NOT_FOUND')
  }

  // 创建项目道具
  const projectProp = await prisma.novelPromotionProp.create({
    data: {
      novelPromotionProjectId: novelData.id,
      name: globalProp.name,
      category: globalProp.category,
      description: globalProp.description,
      sourceGlobalPropId: globalPropId,
      images: {
        createMany: {
          data: globalProp.images.map((img) => ({
            imageIndex: img.imageIndex,
            imageUrl: img.imageUrl,
            description: img.description,
            imageMediaId: img.imageMediaId
          }))
        }
      }
    },
    include: {
      images: {
        orderBy: { imageIndex: 'asc' }
      }
    }
  })

  return NextResponse.json(projectProp)
})
