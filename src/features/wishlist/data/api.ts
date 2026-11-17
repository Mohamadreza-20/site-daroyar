import { api } from '@/shared/data/client'

interface WishlistResponse {
  productIds: number[]
}

export const fetchWishlist = (signal?: AbortSignal) =>
  api.get<WishlistResponse>('/wishlist', { signal }).then((r) => r.data.productIds)

export const addToWishlist = (id: number) => api.put<WishlistResponse>(`/wishlist/${id}`).then((r) => r.data.productIds)

export const removeFromWishlist = (id: number) =>
  api.delete<WishlistResponse>(`/wishlist/${id}`).then((r) => r.data.productIds)
