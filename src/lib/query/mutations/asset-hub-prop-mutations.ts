import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'
import {
  clearTaskTargetOverlay,
  upsertTaskTargetOverlay,
} from '../task-target-overlay'
import { queryKeys } from '../keys'
import type { Prop } from '../hooks/useProps'
import {
  requestJsonWithError,
  requestVoidWithError,
} from './mutation-shared'
import {
  GLOBAL_ASSET_PROJECT_ID,
  invalidateGlobalProps,
} from './asset-hub-mutations-shared'

interface SelectPropImageContext {
  previousQueries: Array<{
    queryKey: readonly unknown[]
    data: Prop[] | undefined
  }>
  targetKey: string
  requestId: number
}

interface DeletePropContext {
  previousQueries: Array<{
    queryKey: readonly unknown[]
    data: Prop[] | undefined
  }>
}

function applyPropSelection(
  props: Prop[] | undefined,
  propId: string,
  imageIndex: number | null,
): Prop[] | undefined {
  if (!props) return props
  return props.map((prop) => {
    if (prop.id !== propId) return prop
    return {
      ...prop,
      images: (prop.images || []).map((image) => ({
        ...image,
        isSelected: imageIndex !== null && (image as { imageIndex?: number }).imageIndex === imageIndex,
      })),
    }
  })
}

function capturePropQuerySnapshots(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient
    .getQueriesData<Prop[]>({
      queryKey: queryKeys.globalAssets.props(),
      exact: false,
    })
    .map(([queryKey, data]) => ({ queryKey, data }))
}

function restorePropQuerySnapshots(
  queryClient: ReturnType<typeof useQueryClient>,
  snapshots: Array<{ queryKey: readonly unknown[]; data: Prop[] | undefined }>,
) {
  snapshots.forEach((snapshot) => {
    queryClient.setQueryData(snapshot.queryKey, snapshot.data)
  })
}

export function useGeneratePropImage() {
  const queryClient = useQueryClient()
  const invalidateProps = () => invalidateGlobalProps(queryClient)

  return useMutation({
    mutationFn: async ({
      propId,
      count,
    }: {
      propId: string
      count?: number
    }) => {
      return await requestJsonWithError('/api/asset-hub/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'prop', id: propId, count }),
      }, 'Failed to generate prop image')
    },
    onMutate: ({ propId }) => {
      upsertTaskTargetOverlay(queryClient, {
        projectId: GLOBAL_ASSET_PROJECT_ID,
        targetType: 'GlobalProp',
        targetId: propId,
        intent: 'generate',
      })
    },
    onError: (_error, { propId }) => {
      clearTaskTargetOverlay(queryClient, {
        projectId: GLOBAL_ASSET_PROJECT_ID,
        targetType: 'GlobalProp',
        targetId: propId,
      })
    },
    onSettled: invalidateProps,
  })
}

export function useSelectPropImage() {
  const queryClient = useQueryClient()
  const latestRequestIdByTargetRef = useRef<Record<string, number>>({})
  const invalidateProps = () => invalidateGlobalProps(queryClient)

  return useMutation({
    mutationFn: async ({
      propId,
      imageIndex,
      confirm = false,
    }: {
      propId: string
      imageIndex: number | null
      confirm?: boolean
    }) => {
      return await requestJsonWithError('/api/asset-hub/select-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'prop', id: propId, imageIndex, confirm }),
      }, 'Failed to select prop image')
    },
    onMutate: async (variables): Promise<SelectPropImageContext> => {
      const targetKey = variables.propId
      const requestId = (latestRequestIdByTargetRef.current[targetKey] ?? 0) + 1
      latestRequestIdByTargetRef.current[targetKey] = requestId

      await queryClient.cancelQueries({ queryKey: queryKeys.globalAssets.props(), exact: false })
      const previousQueries = capturePropQuerySnapshots(queryClient)

      queryClient.setQueriesData<Prop[] | undefined>(
        { queryKey: queryKeys.globalAssets.props(), exact: false },
        (previous) => applyPropSelection(previous, variables.propId, variables.imageIndex),
      )

      return { previousQueries, targetKey, requestId }
    },
    onError: (_error, _variables, context) => {
      if (!context) return
      const latestRequestId = latestRequestIdByTargetRef.current[context.targetKey]
      if (latestRequestId !== context.requestId) return
      restorePropQuerySnapshots(queryClient, context.previousQueries)
    },
    onSettled: (_data, _error, variables) => {
      if (variables.confirm) void invalidateProps()
    },
  })
}

export function useUndoPropImage() {
  const queryClient = useQueryClient()
  const invalidateProps = () => invalidateGlobalProps(queryClient)

  return useMutation({
    mutationFn: async (propId: string) => {
      return await requestJsonWithError('/api/asset-hub/undo-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'prop', id: propId }),
      }, 'Failed to undo prop image')
    },
    onSuccess: invalidateProps,
  })
}

export function useUploadPropImage() {
  const queryClient = useQueryClient()
  const invalidateProps = () => invalidateGlobalProps(queryClient)

  return useMutation({
    mutationFn: async ({
      file,
      propId,
      labelText,
      imageIndex,
    }: {
      file: File
      propId: string
      labelText: string
      imageIndex?: number
    }) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'prop')
      formData.append('id', propId)
      formData.append('labelText', labelText)
      if (imageIndex !== undefined) {
        formData.append('imageIndex', imageIndex.toString())
      }
      return await requestJsonWithError('/api/asset-hub/upload-image', {
        method: 'POST',
        body: formData,
      }, 'Failed to upload prop image')
    },
    onSuccess: invalidateProps,
  })
}

export function useDeleteGlobalPropMutation() {
  const queryClient = useQueryClient()
  const invalidateProps = () => invalidateGlobalProps(queryClient)

  return useMutation({
    mutationFn: async (propId: string) => {
      await requestVoidWithError(
        `/api/asset-hub/props?id=${propId}`,
        { method: 'DELETE' },
        'Failed to delete prop',
      )
    },
    onMutate: async (propId): Promise<DeletePropContext> => {
      await queryClient.cancelQueries({ queryKey: queryKeys.globalAssets.props(), exact: false })
      const previousQueries = capturePropQuerySnapshots(queryClient)

      queryClient.setQueriesData<Prop[] | undefined>(
        { queryKey: queryKeys.globalAssets.props(), exact: false },
        (previous) => previous?.filter((p) => p.id !== propId),
      )

      return { previousQueries }
    },
    onError: (_error, _propId, context) => {
      if (!context) return
      restorePropQuerySnapshots(queryClient, context.previousQueries)
    },
    onSettled: invalidateProps,
  })
}
