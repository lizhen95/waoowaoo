'use client'

import { useState } from 'react'
import { AppIcon } from '@/components/ui/icons'

export interface PropCardProps {
  propId: string
  name: string
  category: string
  imageUrl?: string | null
  description?: string | null
  onEdit?: () => void
  onDelete?: () => void
  onSelectImage?: () => void
  isSelected?: boolean
}

const CATEGORY_COLORS: Record<string, string> = {
  weapon: 'bg-red-100 text-red-800',
  clothing: 'bg-purple-100 text-purple-800',
  furniture: 'bg-yellow-100 text-yellow-800',
  food: 'bg-orange-100 text-orange-800',
  vehicle: 'bg-blue-100 text-blue-800',
  tool: 'bg-gray-100 text-gray-800',
  decoration: 'bg-pink-100 text-pink-800',
  electronic: 'bg-green-100 text-green-800',
  nature: 'bg-emerald-100 text-emerald-800',
  other: 'bg-slate-100 text-slate-800',
}

const CATEGORY_LABELS: Record<string, string> = {
  weapon: '武器',
  clothing: '服装',
  furniture: '家具',
  food: '食物',
  vehicle: '交通工具',
  tool: '工具',
  decoration: '装饰品',
  electronic: '电子产品',
  nature: '自然物品',
  other: '其他',
}

export function PropCard({
  propId,
  name,
  category,
  imageUrl,
  description,
  onEdit,
  onDelete,
  onSelectImage,
  isSelected,
}: PropCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className={`bg-white rounded-lg border overflow-hidden hover:shadow-md transition-shadow ${isSelected ? 'border-blue-500 shadow-md' : 'border-gray-200'}`}>
      {/* 图像区域 */}
      <div className="relative w-full h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <AppIcon name="image" size={32} />
            <span className="text-xs mt-2">无图像</span>
          </div>
        )}
        {onSelectImage && (
          <button
            onClick={onSelectImage}
            className="absolute inset-0 bg-black/0 hover:bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
          >
            <AppIcon name="plus" size={32} className="text-white" />
          </button>
        )}
      </div>

      {/* 内容区域 */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-sm truncate flex-1">{name}</h3>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <AppIcon name="menu" size={16} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-10">
                {onEdit && (
                  <button
                    onClick={() => {
                      onEdit()
                      setShowMenu(false)
                    }}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                  >
                    编辑
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      onDelete()
                      setShowMenu(false)
                    }}
                    className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    删除
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 分类标签 */}
        <div className="mb-2">
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${CATEGORY_COLORS[category] || CATEGORY_COLORS.other}`}>
            {CATEGORY_LABELS[category] || category}
          </span>
        </div>

        {/* 描述 */}
        {description && (
          <p className="text-xs text-gray-600 line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
