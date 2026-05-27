import { useState, type ReactNode } from 'react'

export type NavigationItem = {
  label: string
  hint: string
  route: string
  badge?: string
  active?: boolean
}

export type NavigationSection = {
  title: string
  items: NavigationItem[]
}

type OperationalShellProps = {
  appName: string
  environmentLabel: string
  unitLabel: string
  navigationSections: NavigationSection[]
  currentRoute: string
  onNavigate: (route: string) => void
  children: ReactNode
}

export function OperationalShell({
  appName,
  environmentLabel,
  unitLabel,
  navigationSections,
  currentRoute,
  onNavigate,
  children,
}: OperationalShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  function handleNavigate(route: string) {
    onNavigate(route)
    setIsSidebarOpen(false)
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__brand">
          <button
            type="button"
            className="nav-toggle"
            onClick={() => setIsSidebarOpen((open) => !open)}
            aria-expanded={isSidebarOpen}
            aria-controls="app-sidebar"
            aria-label="Alternar menu lateral"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div>
            <span className="app-header__eyebrow">{environmentLabel}</span>
            <strong>{appName}</strong>
          </div>
        </div>

        <div className="app-header__meta">
          <div className="header-chip">
            <span className="header-chip__label">Unidade</span>
            <strong>{unitLabel}</strong>
          </div>
          <div className="header-chip header-chip--accent">
            <span className="header-chip__label">Plantao</span>
            <strong>Monitorado</strong>
          </div>
        </div>
      </header>

      <div className="app-shell__body">
        <aside
          id="app-sidebar"
          className={`app-sidebar ${isSidebarOpen ? 'app-sidebar--open' : ''}`}
        >
          <div className="app-sidebar__summary">
            <span className="sidebar-kicker">Fluxo assistencial</span>
            <h2>Menu operacional</h2>
            <p>
              Navegacao preparada para crescimento do sistema sem perder clareza
              entre atendimento, estoque e governanca.
            </p>
          </div>

          <nav className="app-sidebar__nav" aria-label="Menu principal">
            {navigationSections.map((section) => (
              <section key={section.title} className="nav-section">
                <span className="nav-section__title">{section.title}</span>

                <div className="nav-section__items">
                  {section.items.map((item) => {
                    const active = item.active ?? item.route === currentRoute

                    return (
                      <button
                        key={item.route}
                        type="button"
                        className={`nav-item ${active ? 'nav-item--active' : ''}`}
                        onClick={() => handleNavigate(item.route)}
                      >
                        <div className="nav-item__copy">
                          <strong>{item.label}</strong>
                          <span>{item.hint}</span>
                        </div>

                        {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
                      </button>
                    )
                  })}
                </div>
              </section>
            ))}
          </nav>
        </aside>

        {isSidebarOpen ? (
          <button
            type="button"
            className="app-sidebar__overlay"
            aria-label="Fechar menu lateral"
            onClick={() => setIsSidebarOpen(false)}
          />
        ) : null}

        <main className="app-main">
          <div className="app-main__content">{children}</div>
        </main>
      </div>
    </div>
  )
}
