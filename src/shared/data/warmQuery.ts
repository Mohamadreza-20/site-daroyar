import type { QueryClient, QueryExecuteOptions, QueryKey } from '@tanstack/react-query'

export function warmQuery<TData, TKey extends QueryKey>(
  client: QueryClient,
  options: QueryExecuteOptions<TData, Error, TData, TData, TKey>,
) {
  client.query(options).catch(() => undefined)
}
