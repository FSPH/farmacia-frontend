import './App.css'
import {
  OperationalShell,
  type NavigationSection,
} from './layouts/OperationalShell'
import { usePathRouter } from './hooks/usePathRouter'
import { RequisicoesPage } from './pages/RequisicoesPage'
import { EstoquePage } from './pages/EstoquePage'
import { InventariosPage } from './pages/InventariosPage'
import { CadastrosPage } from './pages/CadastrosPage'

const baseNavigationSections: NavigationSection[] = [
  {
    title: 'Cadastros',
    items: [
      { label: 'Tabelas de apoio', hint: 'Medicamentos, BONAME e parametros', route: '/cadastros' },
    ],
  },
  {
    title: 'Atendimento',
    items: [
      { label: 'Requisicoes', hint: 'Fila, paciente e aprovacao', route: '/requisicoes' },
    ],
  },
  {
    title: 'Estoques',
    items: [
      { label: 'Estoque', hint: 'Saldo por deposito e lote', route: '/estoque' },
      { label: 'Inventarios', hint: 'Competencias e fechamento', route: '/inventarios' },
    ],
  },
  {
    title: 'Governanca',
    items: [
      { label: 'Relatorios', hint: 'Em breve', route: '/relatorios' },
    ],
  },
]

function NotReadyPage() {
  return (
    <section className="panel-card">
      <div className="panel-card__header">
        <div>
          <span className="panel-kicker">Em evolucao</span>
          <h2>Modulo em preparacao</h2>
        </div>
      </div>
      <div className="state-block">
        <strong>Area reservada para proximas telas</strong>
        <p>Este item do menu ainda nao recebeu a primeira postagem funcional.</p>
      </div>
    </section>
  )
}

function renderPage(pathname: string) {
  switch (pathname) {
    case '/requisicoes':
      return <RequisicoesPage />
    case '/estoque':
      return <EstoquePage />
    case '/inventarios':
      return <InventariosPage />
    default:
      return <NotReadyPage />
  }
}

function App() {
  const { pathname, navigate } = usePathRouter()

  const navigationSections = baseNavigationSections.map((section) => ({
    ...section,
    items: section.items.map((item) => ({
      ...item,
      active:
        item.route === '/cadastros'
          ? pathname === '/cadastros' || pathname.startsWith('/cadastros/')
          : item.route === pathname,
    })),
  }))

  return (
    <OperationalShell
      appName="Farmacia Ambulatorial"
      environmentLabel="Hospitalar"
      unitLabel="Unidade Central"
      navigationSections={navigationSections}
      currentRoute={pathname}
      onNavigate={navigate}
    >
      {pathname === '/cadastros' || pathname.startsWith('/cadastros/') ? (
        <CadastrosPage pathname={pathname} onNavigate={navigate} />
      ) : (
        renderPage(pathname)
      )}
    </OperationalShell>
  )
}

export default App
