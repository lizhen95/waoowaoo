'use client'

import { useState } from 'react'
import { PropCard } from './PropCard'
import { PropEditModal } from './PropEditModal'
import { AppIcon } from '@/components/ui/icons'

export interface Prop {
  id: string
  name: string
  category: string
  description?: string | null
  images?: Array<{
    id: string
    imageUrl?: string | null
    isSelected?: boolean
  }>
}

export interface PropGridProps {
  props: Prop[]
  mode: 'asset-hub' | 'project'
  projectId?: string
  onPropDeleted?: (propId: string) => void
  onPropUpdated?: (propId: string) => void
  onAddProp?: () => void
}

export function PropGrid({
  props,
  mode,
  projectId,
  onPropDeleted,
  onPropUpdated,
  onAddProp,
}: PropGridProps) {
  const [editingProp, setEditingProp] = useState<Prop | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleDeleteProp = async (propId: string) => {
    if (!confirm('确定要删除这个道具吗？/ Are you sure?')) return

    setIsDeleting(propId)
    try {
      const endpoint = mode === 'asset-hub'
        ? `/api/asset-hub/props?id=${propId}`
        : `/api/novel-promotion/${projectId}/props?id=${propId}`

      const response = await fetch(endpoint, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete')

      onPropDeleted?.(propId)
    } finally {
      setIsDeleting(null)
    }
  }

  const getSelectedImage = (prop: Prop) => {
    return prop.images?.find((img) => img.isSelected)?.imageUrl || prop.images?.[0]?.imageUrl
  }

  if (props.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <AppIcon name="folder" size={48} className="mb-4 opacity-50" />
        <p className="text-sm mb-4">暂无道具 / No props yet</p>
        {onAddProp && (
          <button
            onClick={onAddProp}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            添加道具 / Add Prop
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {props.map((prop) => (
          <PropCard
            key={prop.id}
            propId={prop.id}
            name={prop.name}
            category={prop.category}
            imageUrl={getSelectedImage(prop)}
            description={prop.description}
            onEdit={() => setEditingProp(prop)}
            onDelete={() => handleDeleteProp(prop.id)}
            isSelected={isDeleting === prop.id}
          />
        ))}
      </div>

      {editingProp && (
        <PropEditModal
          mode={mode}
          propId={editingProp.id}
          propName={editingProp.name}
          category={editingProp.category}
          description={editingProp.description || ''}
          projectId={projectId}
          onClose={() => setEditingProp(null)}
          onSave={(propId) => {
            onPropUpdated?.(propId)
            setEditingProp(null)
          }}
          onNameUpdate={(newName) => {
            if (editingProp) {
              setEditingProp({ ...editingProp, name: newName })
            }
          }}
          onCategoryUpdate={(newCategory) => {
            if (editingProp) {
              setEditingProp({ ...editingProp, category: newCategory })
            }
          }}
          onUpdate={(newDescription) => {
            if (editingProp) {
              setEditingProp({ ...editingProp, description: newDescription })
            }
          }}
        />
      )}
    </div>
  )
}
