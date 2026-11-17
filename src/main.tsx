import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router'
import '@fontsource-variable/vazirmatn'
import '@/styles/index.css'
import { queryClient } from '@/shared/data/queryClient'
import { router } from '@/app/routes'
import { prefetchForPath } from '@/app/prefetch'

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root was not found')

prefetchForPath(queryClient, window.location.pathname, window.location.search)

createRoot(container).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
