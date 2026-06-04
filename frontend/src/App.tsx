import { useState } from 'react'
import MainLayout from './components/MainLayout'
import { APP_SECTIONS, QUICK_ACTIONS, type SectionKey } from './config/navigation'
import './App.css'
import BonamePage from './pages/BonamePage'
import DepositosPage from './pages/DepositosPage'
import DiagnosticosPage from './pages/DiagnosticosPage'
import HomeDashboardPage from './pages/HomeDashboardPage'
import ModulePlaceholderPage from './pages/ModulePlaceholderPage'
import TiposMedicamentosPage from './pages/TiposMedicamentosPage'

const DEFAULT_SECTION_KEY: SectionKey = 'inicio'

function App() {
  const [activeSectionKey, setActiveSectionKey] = useState<SectionKey>(DEFAULT_SECTION_KEY)
  const section = APP_SECTIONS[activeSectionKey]
  const isCadastroSection =
    activeSectionKey === 'parametros/boname'
    || activeSectionKey === 'parametros/depositos'
    || activeSectionKey === 'parametros/diagnosticos'
    || activeSectionKey === 'parametros/tipos_medicamentos'

  return (
    <MainLayout
      activeSidebarKey={activeSectionKey}
      breadcrumbItems={section.breadcrumbItems}
      onQuickActionSelect={setActiveSectionKey}
      onSidebarSelect={setActiveSectionKey}
      pageBannerCompact={isCadastroSection}
      pageDescription={section.description}
      pageMetaVisible={!isCadastroSection}
      pageStatus={section.status}
      pageTitle={section.title}
      quickActions={QUICK_ACTIONS}
    >
      {activeSectionKey === 'inicio' ? (
        <HomeDashboardPage onOpenSection={setActiveSectionKey} />
      ) : activeSectionKey === 'parametros/boname' ? (
        <BonamePage />
      ) : activeSectionKey === 'parametros/depositos' ? (
        <DepositosPage />
      ) : activeSectionKey === 'parametros/tipos_medicamentos' ? (
        <TiposMedicamentosPage />
      ) : activeSectionKey === 'parametros/diagnosticos' ? (
        <DiagnosticosPage />
      ) : (
        <ModulePlaceholderPage
          moduleKey={activeSectionKey}
          moduleLabel={section.title}
          onOpenDashboard={() => setActiveSectionKey('inicio')}
        />
      )}
    </MainLayout>
  )
}

export default App
