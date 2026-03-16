'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { AppIcon } from '@/components/ui/icons'

export interface PropEditModalProps {
  mode: 'asset-hub' | 'project'
  propId: string
  propName: string
  category: string
  description: string
  projectId?: string
  onClose: () => void
  onSave: (propId: string) => void
  onUpdate?: (newDescription: string) => void
  onNameUpdate?: (newName: string) => void
  onCategoryUpdate?: (newCategory: string) => void
}

const PROP_CATEGORIES = [
  { value: 'weapon', label: '武器 / Weapon' },
  { value: 'clothing', label: '服装 / Clothing' },
  { value: 'furniture', label: '家具 / Furniture' },
  { value: 'food', label: '食物 / Food' },
  { value: 'vehicle', label: '交通工具 / Vehicle' },
  { value: 'tool', label: '工具 / Tool' },
  { value: 'decoration', label: '装饰品 / Decoration' },
  { value: 'electronic', label: '电子产品 / Electronic' },
  { value: 'nature', label: '自然物品 / Nature' },
  { value: 'other', label: '其他 / Other' },
]

export function PropEditModal({
  mode,
  propId,
  propName,
  category,
  description,
  projectId,
  onClose,
  onSave,
  onUpdate,
  onNameUpdate,
  onCategoryUpdate,
}: PropEditModalProps) {
  const t = useTranslations('assets')

  const [editingName, setEditingName] = useState(propName)
  const [editingCategory, setEditingCategory] = useState(category)
  const [editingDescription, setEditingDescription] = useState(description)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const endpoint = mode === 'asset-hub'
        ? '/api/asset-hub/props'
        : `/api/novel-promotion/${projectId}/props`

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propId,
          name: editingName !== propName ? editingName : undefined,
          category: editingCategory !== category ? editingCategory : undefined,
          description: editingDescription !== description ? editingDescription : undefined,
        }),
      })

      if (!response.ok) throw new Error('Failed to save')

      if (editingName !== propName && onNameUpdate) onNameUpdate(editingName)
      if (editingCategory !== category && onCategoryUpdate) onCategoryUpdate(editingCategory)
      if (editingDescription !== description && onUpdate) onUpdate(editingDescription)

      onSave(propId)
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">编辑道具 / Edit Prop</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <AppIcon name="close" size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* 名称 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              名称 / Name
            </label>
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 分类 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              分类 / Category
            </label>
            <select
              value={editingCategory}
              onChange={(e) => setEditingCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PROP_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              描述 / Description
            </label>
            <textarea
              value={editingDescription}
              onChange={(e) => setEditingDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            取消 / Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? '保存中...' : '保存 / Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
