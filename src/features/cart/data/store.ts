import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ownerKeyOf, useAuthStore } from '@/features/auth/data/store'
import { MAX_CART_LINES, clampQty, maxQtyFor } from '@/shared/domain/orderLimits'
import type { Coupon, Product } from '@/shared/domain/types'
import type { AddResult } from '@/features/cart/domain/cartRules'

export interface CartItem {
  id: number | string
  qty: number
}

export interface CartState {
  items: readonly CartItem[]
  coupon: Coupon | null
}

interface CartStore {
  carts: Record<string, CartState>
  addItem: (product: Pick<Product, 'id' | 'stock'>, qty?: number) => AddResult
  setQty: (id: number | string, qty: number, max?: number) => void
  removeItem: (id: number | string) => void
  clear: () => void
  setCoupon: (coupon: Coupon) => void
  removeCoupon: () => void
  mergeGuestInto: (ownerKey: string) => void
}

const EMPTY_CART: CartState = Object.freeze({ items: Object.freeze([]) as readonly CartItem[], coupon: null })

const sameId = (a: number | string, b: number | string) => String(a) === String(b)
const currentOwner = () => ownerKeyOf(useAuthStore.getState().user)

export const useCartStore = create<CartStore>()(
  persist(
    (set) => {
      const update = (fn: (cart: CartState) => CartState) =>
        set((state) => {
          const owner = currentOwner()
          return { carts: { ...state.carts, [owner]: fn(state.carts[owner] ?? EMPTY_CART) } }
        })

      return {
        carts: {},
        addItem: (product, qty = 1) => {
          const max = maxQtyFor(product.stock)
          if (!max) return 'unavailable'
          const wanted = Math.max(1, Math.floor(Number(qty) || 1))
          let result: AddResult = 'added'
          update((cart) => {
            const existing = cart.items.find((item) => sameId(item.id, product.id))
            if (!existing && cart.items.length >= MAX_CART_LINES) {
              result = 'full'
              return cart
            }
            const current = existing?.qty ?? 0
            const next = Math.min(current + wanted, max)
            if (next === current) {
              result = 'limit'
              return cart
            }
            if (next < current + wanted) result = 'limited'
            const items = existing
              ? cart.items.map((item) => (sameId(item.id, product.id) ? { ...item, qty: next } : item))
              : [...cart.items, { id: product.id, qty: next }]
            return { ...cart, items }
          })
          return result
        },
        setQty: (id, qty, max) =>
          update((cart) => ({
            ...cart,
            items: cart.items.map((item) => (sameId(item.id, id) ? { ...item, qty: clampQty(qty, max) } : item)),
          })),
        removeItem: (id) => update((cart) => ({ ...cart, items: cart.items.filter((item) => !sameId(item.id, id)) })),
        clear: () => update(() => EMPTY_CART),
        setCoupon: (coupon) => update((cart) => ({ ...cart, coupon })),
        removeCoupon: () => update((cart) => ({ ...cart, coupon: null })),
        mergeGuestInto: (ownerKey) =>
          set((state) => {
            const guest = state.carts.guest
            if (!guest?.items.length || ownerKey === 'guest') return state
            const target = state.carts[ownerKey] ?? EMPTY_CART
            const items = [...target.items]
            for (const entry of guest.items) {
              const found = items.findIndex((item) => sameId(item.id, entry.id))
              const existing = items[found]
              if (existing) items[found] = { ...existing, qty: clampQty(existing.qty + entry.qty) }
              else if (items.length < MAX_CART_LINES) items.push(entry)
            }
            return {
              carts: {
                ...state.carts,
                guest: EMPTY_CART,
                [ownerKey]: { items, coupon: target.coupon ?? guest.coupon },
              },
            }
          }),
      }
    },
    { name: 'daroyar-cart', version: 3, migrate: () => ({ carts: {} }) },
  ),
)

export function useCart(): CartState {
  const owner = useAuthStore((state) => ownerKeyOf(state.user))
  return useCartStore((state) => state.carts[owner] ?? EMPTY_CART)
}

let previousOwner = ownerKeyOf(useAuthStore.getState().user)
useAuthStore.subscribe((state) => {
  const owner = ownerKeyOf(state.user)
  if (owner !== previousOwner) {
    previousOwner = owner
    useCartStore.getState().mergeGuestInto(owner)
  }
})
