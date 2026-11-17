import {
  Hourglass,
  Lock,
  SearchX,
  ServerCrash,
  ShieldAlert,
  TriangleAlert,
  WifiOff,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

export const ERROR_ICONS: Record<number | 'default', LucideIcon> = {
  0: WifiOff,
  400: TriangleAlert,
  401: Lock,
  403: ShieldAlert,
  404: SearchX,
  408: Hourglass,
  429: Hourglass,
  500: ServerCrash,
  503: Wrench,
  default: TriangleAlert,
}
