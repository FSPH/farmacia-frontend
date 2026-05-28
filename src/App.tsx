import { useState } from 'react'
import { Button, Message } from 'rsuite'
import MainLayout from './components/MainLayout'
import BonamePage from './pages/BonamePage'
import './App.css'

type AppSection = {
  breadcrumbItems: string[]
  description: string
  title: string
}

const DEFAULT_SECTION_KEY = 'parametros/boname'

const APP_SECTIONS: Record<string, AppSection> = {
  inicio: {
    breadcrumbItems: ['Inicio', 'Farmacia', 'Dashboard'],
    title: 'Workspace principal',
    description: 'Estrutura pronta para receber rotas, modulos e dados do sistema.',
  },
  'parametros/boname': {
    breadcrumbItems: ['Inicio', 'Parametros', 'Boname'],
    title: 'Cadastro de Boname',
    description: '',
  },
}

function DashboardPlaceholder({ onOpenBoname }: { onOpenBoname: () => void }) {
  return (
    <section className="app-page">
      <div className="app-page__hero">
        <span className="app-page__eyebrow">Base pronta</span>
        <h1>Area principal para futuras paginas</h1>
        <p>
          O layout principal ja esta preparado com header fixo, sidebar retratil e uma regiao de conteudo
          pronta para receber rotas e modulos da aplicacao.
        </p>
        <div className="app-page__hero-actions">
          <Button appearance="primary" onClick={onOpenBoname}>
            Abrir Boname
          </Button>
        </div>
      </div>

      <div className="app-page__grid">
        <article className="app-card">
          <span>Header</span>
          <strong>Navegacao superior simples e fixa</strong>
        </article>
        <article className="app-card">
          <span>Sidebar</span>
          <strong>Menu vertical com Sidenav do rsuite</strong>
        </article>
        <article className="app-card">
          <span>Content</span>
          <strong>Area flexivel pronta para children e modulos</strong>
        </article>
      </div>
    </section>
  )
}

function PendingModule({ moduleKey }: { moduleKey: string }) {
  return (
    <section className="app-page">
      <Message showIcon type="info">
        O modulo <strong>{moduleKey}</strong> ainda nao foi implementado no frontend.
      </Message>
    </section>
  )
}

function App() {
  const [activeSectionKey, setActiveSectionKey] = useState(DEFAULT_SECTION_KEY)
  const section = APP_SECTIONS[activeSectionKey] || {
    breadcrumbItems: ['Inicio', 'Modulo'],
    title: 'Modulo em construcao',
    description: 'Selecione outro item do menu ou continue a implementacao deste fluxo.',
  }

  return (
    <MainLayout
      activeSidebarKey={activeSectionKey}
      breadcrumbItems={section.breadcrumbItems}
      hidePageChrome={activeSectionKey === 'parametros/boname'}
      pageTitle={section.title}
      pageDescription={section.description}
      onSidebarSelect={setActiveSectionKey}
    >
      {activeSectionKey === 'inicio' ? (
        <DashboardPlaceholder onOpenBoname={() => setActiveSectionKey('parametros/boname')} />
      ) : activeSectionKey === 'parametros/boname' ? (
        <BonamePage />
      ) : (
        <PendingModule moduleKey={activeSectionKey} />
      )}
    </MainLayout>
  )
}

export default App
