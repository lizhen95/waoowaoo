'use client'

import { useState } from 'react'
import { PropCard } from './PropCard'
import { PropEditModal } from './PropEditModal'
import { AppIcon } from '@/components/ui/icons'
import type { PropImage } from '@/lib/query/hooks/useProps'

export interface Prop {
  id: string
  name: string
  category: string
  description?: string | null
  images?: PropImage[]
}

export interface PropGridProps {
  props: Prop[]
  mode: 'asset-hub' | 'project'
  projectId?: string
  onPropUpdated?: (propId: string) => void
  onAddProp?: () => void
}

export function PropGrid({
  props,
  mode,
  projectId,
  onPropUpdated,
  onAddProp,
}: PropGridProps) {
  const [editingProp, setEditingProp] = useState<Prop | null>(null)

  if (props.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-[var(--glass-text-tertiary)]">
        <AppIcon name="folder" size={48} className="mb-4 opacity-50" />
        <p className="text-sm mb-4">暂无道具</p>
        {onAddProp && (
          <button onClick={onAddProp} className="glass-btn-base glass-btn-primary px-4 py-2 rounded-lg text-sm">
            添加道具
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
            images={prop.images ?? []}
            description={prop.description}
            onEdit={() => setEditingProp(prop)}
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
            if (editingProp) setEditingProp({ ...editingProp, name: newName })
          }}
          onCategoryUpdate={(newCategory) => {
            if (editingProp) setEditingProp({ ...editingProp, category: newCategory })
          }}
          onUpdate={(newDescription) => {
            if (editingProp) setEditingProp({ ...editingProp, description: newDescription })
          }}
        />
      )}
    </div>
  )
}
