import { API_BASE } from '@/shared/data/client'

export const assetPath = (src: string): string => (src.startsWith(`${API_BASE}/`) ? src.slice(API_BASE.length) : src)

export const assetUrl = (src: string): string => (src.startsWith('/') ? `${API_BASE}${src}` : src)
