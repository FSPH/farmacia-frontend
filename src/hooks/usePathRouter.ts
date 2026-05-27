import { useEffect, useState } from 'react'

function normalizePath(pathname: string) {
  if (!pathname || pathname === '/') {
    return '/requisicoes'
  }

  return pathname
}

export function usePathRouter() {
  const [pathname, setPathname] = useState(() => normalizePath(window.location.pathname))

  useEffect(() => {
    const onPopState = () => setPathname(normalizePath(window.location.pathname))

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  function navigate(nextPath: string) {
    const normalized = normalizePath(nextPath)

    if (normalized === pathname) {
      return
    }

    window.history.pushState({}, '', normalized)
    setPathname(normalized)
  }

  return {
    pathname,
    navigate,
  }
}
