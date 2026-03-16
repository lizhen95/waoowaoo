'use client'

import { useState } from 'react'
import { AppIcon } from '@/components/ui/icons'

export interface PropCreationModalProps {
  mode: 'asset-hub' | 'project'
  projectId?: string
  onClose: () => void
  onCreated: (propId: string) => void
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

export function PropCreationModal({
  mode,
  projectId,
  onClose,
  onCreated,
}: PropCreationModalProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('other')
  const [description, setDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('请输入道具名称 / Please enter prop name')
      return
    }

    setIsCreating(true)
    setError('')

    try {
      const endpoint = mode === 'asset-hub'
        ? '/api/asset-hub/props'
        : `/api/novel-promotion/${projectId}/props`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category,
          description: description.trim() || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create prop')
      }

      const data = await response.json()
      onCreated(data.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create prop')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">新建道具 / Create Prop</h2>
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
              名称 / Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入道具名称 / Enter prop name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 分类 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              分类 / Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="输入道具描述 / Enter prop description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            取消 / Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isCreating ? '创建中...' : '创建 / Create'}
          </button>
        </div>
      </div>
    </div>
  )
}
