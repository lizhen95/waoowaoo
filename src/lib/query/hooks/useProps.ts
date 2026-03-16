import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api-fetch'
import { queryKeys } from '@/lib/query/keys'

export interface PropImage {
  id: string
  imageIndex: number
  description: string | null
  imageUrl: string | null
  previousImageUrl: string | null
  isSelected: boolean
  imageTaskRunning: boolean
  imageErrorMessage?: string | null
  lastError?: { code: string; message: string } | null
}

export interface Prop {
  id: string
  name: string
  category: string
  description?: string | null
  images?: PropImage[]
}

// 全局道具 hooks
export function useGlobalProps(folderId?: string | null) {
  return useQuery({
    queryKey: queryKeys.globalAssets.props(folderId),
    queryFn: async () => {
      const url = new URL('/api/asset-hub/props', window.location.origin)
      if (folderId) url.searchParams.set('folderId', folderId)
      const res = await apiFetch(url.toString())
      if (!res.ok) throw new Error('Failed to fetch props')
      return res.json() as Promise<Prop[]>
    },
  })
}

export function useCreateGlobalProp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string; category: string; description?: string }) => {
      const res = await apiFetch('/api/asset-hub/props', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create prop')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.globalAssets.props() })
    },
  })
}

export function useUpdateGlobalProp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { propId: string; name?: string; category?: string; description?: string }) => {
      const res = await apiFetch('/api/asset-hub/props', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update prop')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.globalAssets.props() })
    },
  })
}

export function useDeleteGlobalProp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (propId: string) => {
      const res = await apiFetch(`/api/asset-hub/props?id=${propId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete prop')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.globalAssets.props() })
    },
  })
}

// 项目道具 hooks
export function useProjectProps(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projectAssets.props(projectId),
    queryFn: async () => {
      const res = await apiFetch(`/api/novel-promotion/${projectId}/props`)
      if (!res.ok) throw new Error('Failed to fetch project props')
      return res.json() as Promise<Prop[]>
    },
  })
}

export function useCreateProjectProp(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string; category: string; description?: string }) => {
      const res = await apiFetch(`/api/novel-promotion/${projectId}/props`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create prop')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projectAssets.props(projectId) })
    },
  })
}

export function useUpdateProjectProp(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { propId: string; name?: string; category?: string; description?: string }) => {
      const res = await apiFetch(`/api/novel-promotion/${projectId}/props`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update prop')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projectAssets.props(projectId) })
    },
  })
}

export function useDeleteProjectProp(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (propId: string) => {
      const res = await apiFetch(`/api/novel-promotion/${projectId}/props?id=${propId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete prop')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projectAssets.props(projectId) })
    },
  })
}

export function useCopyGlobalPropToProject(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (globalPropId: string) => {
      const res = await apiFetch(`/api/novel-promotion/${projectId}/props/copy-from-global`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ globalPropId }),
      })
      if (!res.ok) throw new Error('Failed to copy prop')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projectAssets.props(projectId) })
    },
  })
}
