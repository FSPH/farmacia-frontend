import { useSyncExternalStore } from 'react'

export type AppRoute = 'requisicoes' | 'estoque' | 'inventarios'

type RouteMeta = {
  path: string
  title: string
  description: string
}

const DEFAULT_ROUTE: AppRoute = 'requisicoes'

const routeRegistry: Record<AppRoute, RouteMeta> = {
  requisicoes: {
    path: '/requisicoes',
    title: 'Requisicoes',
    description:
      'Acompanhamento da fila assistencial, aprovacoes e prontidao para dispensacao.',
  },
  estoque: {
    path: '/estoque',
    title: 'Estoque',
    description:
      'Visao de saldo, validade e alertas por deposito, medicamento e lote.',
  },
  inventarios: {
    path: '/inventarios',
    title: 'Inventarios',
    description:
      'Controle das contagens, divergencias e fechamento mensal dos inventarios.',
  },
}

function parseRouteFromHash(hash: string): AppRoute {
  const normalized = hash.replace(/^#/, '').replace(/\/+$/, '') || routeRegistry[DEFAULT_ROUTE].path
  const route = (Object.entries(routeRegistry).find(([, meta]) => meta.path === normalized)?.[0] ??
    DEFAULT_ROUTE) as AppRoute

  return route
}

function readCurrentRoute(): AppRoute {
  if (typeof window === 'undefined') {
    return DEFAULT_ROUTE
  }

  return parseRouteFromHash(window.location.hash)
}

function subscribe(onChange: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined
  }

  window.addEventListener('hashchange', onChange)

  return () => {
    window.removeEventListener('hashchange', onChange)
  }
}

export function useCurrentRoute() {
  return useSyncExternalStore(subscribe, readCurrentRoute, () => DEFAULT_ROUTE)
}

export function getRouteMeta(route: AppRoute) {
  return routeRegistry[route]
}

export function navigateTo(route: AppRoute) {
  if (typeof window === 'undefined') {
    return
  }

  const nextHash = `#${routeRegistry[route].path}`

  if (window.location.hash === nextHash) {
    return
  }

  window.location.hash = routeRegistry[route].path
}

export function ensureRoute() {
  if (typeof window === 'undefined') {
    return
  }

  if (!window.location.hash) {
    navigateTo(DEFAULT_ROUTE)
  }
}
