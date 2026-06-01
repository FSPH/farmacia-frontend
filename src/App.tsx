import { useState } from 'react'
import MainLayout from './components/MainLayout'
import { APP_SECTIONS, QUICK_ACTIONS, type SectionKey } from './config/navigation'
import './App.css'
import BonamePage from './pages/BonamePage'
import HomeDashboardPage from './pages/HomeDashboardPage'
import ModulePlaceholderPage from './pages/ModulePlaceholderPage'

const DEFAULT_SECTION_KEY: SectionKey = 'inicio'

function App() {
  const [activeSectionKey, setActiveSectionKey] = useState<SectionKey>(DEFAULT_SECTION_KEY)
  const section = APP_SECTIONS[activeSectionKey]

  return (
    <MainLayout
      activeSidebarKey={activeSectionKey}
      breadcrumbItems={section.breadcrumbItems}
      onQuickActionSelect={setActiveSectionKey}
      onSidebarSelect={setActiveSectionKey}
      pageBannerCompact={activeSectionKey === 'parametros/boname'}
      pageDescription={section.description}
      pageMetaVisible={activeSectionKey !== 'parametros/boname'}
      pageStatus={section.status}
      pageTitle={section.title}
      quickActions={QUICK_ACTIONS}
    >
      {activeSectionKey === 'inicio' ? (
        <HomeDashboardPage onOpenSection={setActiveSectionKey} />
      ) : activeSectionKey === 'parametros/boname' ? (
        <BonamePage />
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
