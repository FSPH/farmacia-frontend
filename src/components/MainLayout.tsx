import { useState, type ReactElement, type ReactNode } from 'react'
import DashboardIcon from '@rsuite/icons/Dashboard'
import DataAuthorizeIcon from '@rsuite/icons/DataAuthorize'
import type { IconProps } from '@rsuite/icons/Icon'
import PeoplesIcon from '@rsuite/icons/Peoples'
import PieChartIcon from '@rsuite/icons/PieChart'
import SearchIcon from '@rsuite/icons/Search'
import SettingIcon from '@rsuite/icons/Setting'
import { SiProtondb } from 'react-icons/si'
import {
  Breadcrumb,
  Button,
  Container,
  Content,
  Header,
  HStack,
  Input,
  InputGroup,
  Nav,
  Placeholder,
  Sidebar,
  Sidenav,
  VStack,
  useMediaQuery,
} from 'rsuite'
import './MainLayout.css'

type NavigationItem = {
  eventKey: string
  icon: ReactElement<IconProps>
  label: string
}

export interface MainLayoutProps {
  children: ReactNode
  activeSidebarKey?: string
  breadcrumbItems?: string[]
  onSidebarSelect?: (eventKey: string) => void
  hidePageChrome?: boolean
  pageDescription?: string
  pageTitle?: string
}

const HEADER_HEIGHT = 64
const EXPANDED_SIDEBAR_WIDTH = 260
const COLLAPSED_SIDEBAR_WIDTH = 72

const SIDEBAR_ITEMS: NavigationItem[] = [
  { eventKey: 'inicio', icon: <DashboardIcon /> as ReactElement<IconProps>, label: 'Inicio' },
  { eventKey: 'pacientes', icon: <PeoplesIcon /> as ReactElement<IconProps>, label: 'Pacientes' },
  { eventKey: 'estoque', icon: <PieChartIcon /> as ReactElement<IconProps>, label: 'Estoque' },
  { eventKey: 'requisicoes', icon: <DataAuthorizeIcon /> as ReactElement<IconProps>, label: 'Requisicoes' },
]

const HEADER_ITEMS: Array<{ eventKey: string; label: string }> = [
  { eventKey: 'visao-geral', label: 'Visao geral' },
  { eventKey: 'operacao', label: 'Operacao' },
  { eventKey: 'suporte', label: 'Suporte' },
]

const SIDEBAR_BRAND = (
  <>
    <SiProtondb size={28} />
    <VStack spacing={2} alignItems="flex-start">
      <strong>Farmacia</strong>
      <span>Ambulatorial</span>
    </VStack>
  </>
)

export function MainLayout({
  children,
  activeSidebarKey: controlledSidebarKey,
  breadcrumbItems = ['Inicio', 'Farmacia', 'Dashboard'],
  hidePageChrome = false,
  onSidebarSelect,
  pageDescription = 'Estrutura pronta para receber rotas, modulos e dados do sistema.',
  pageTitle = 'Workspace principal',
}: MainLayoutProps) {
  const [isMobile] = useMediaQuery('(max-width: 991px)')
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [internalActiveSidebarKey, setInternalActiveSidebarKey] = useState(
    controlledSidebarKey ?? SIDEBAR_ITEMS[0]?.eventKey ?? 'inicio',
  )
  const [activeHeaderKey, setActiveHeaderKey] = useState(HEADER_ITEMS[0]?.eventKey ?? 'visao-geral')
  const activeSidebarKey = controlledSidebarKey ?? internalActiveSidebarKey

  const sidebarWidth = isMobile
    ? EXPANDED_SIDEBAR_WIDTH
    : isSidebarExpanded
      ? EXPANDED_SIDEBAR_WIDTH
      : COLLAPSED_SIDEBAR_WIDTH

  const isSidebarVisible = !isMobile || isMobileSidebarOpen

  const handleSidebarSelect = (eventKey: string | number | undefined) => {
    if (typeof eventKey !== 'string') {
      return
    }

    if (onSidebarSelect) {
      onSidebarSelect(eventKey)
    } else {
      setInternalActiveSidebarKey(eventKey)
    }

    if (isMobile) {
      setIsMobileSidebarOpen(false)
    }
  }

  const handleHeaderSelect = (eventKey: string | number | undefined) => {
    if (typeof eventKey !== 'string') {
      return
    }

    setActiveHeaderKey(eventKey)
  }

  const handleSidebarToggle = () => {
    if (isMobile) {
      setIsMobileSidebarOpen((currentValue) => !currentValue)
      return
    }

    setIsSidebarExpanded((currentValue) => !currentValue)
  }

  return (
    <Container className="main-layout">
      <Header className="main-layout__header">
        <HStack justifyContent="space-between" alignItems="center" className="main-layout__header-row">
          <HStack spacing={12} className="main-layout__header-brand">
            <Button appearance="subtle" className="main-layout__menu-button" onClick={handleSidebarToggle}>
              {isMobile ? 'Menu' : isSidebarExpanded ? 'Recolher' : 'Expandir'}
            </Button>
            <VStack spacing={2} alignItems="flex-start">
              <strong>Farmacia Ambulatorial</strong>
              <span>Painel operacional base</span>
            </VStack>
          </HStack>

          <HStack spacing={16} className="main-layout__header-actions">
            {!isMobile ? (
              <InputGroup inside className="main-layout__search" size="sm">
                <InputGroup.Addon>
                  <SearchIcon />
                </InputGroup.Addon>
                <Input placeholder="Buscar modulo, paciente ou lote" />
              </InputGroup>
            ) : null}

            <Nav
              appearance="subtle"
              activeKey={activeHeaderKey}
              className="main-layout__top-nav"
              onSelect={handleHeaderSelect}
            >
              {HEADER_ITEMS.map((item) => (
                <Nav.Item eventKey={item.eventKey} key={item.eventKey}>
                  {item.label}
                </Nav.Item>
              ))}
            </Nav>
          </HStack>
        </HStack>
      </Header>

      <Container className="main-layout__frame">
        {isSidebarVisible ? (
          <Sidebar
            collapsible
            width={sidebarWidth}
            className={`main-layout__sidebar ${isMobile ? 'main-layout__sidebar--mobile' : ''}`}
            style={{ top: HEADER_HEIGHT }}
          >
            <Sidenav expanded={isMobile ? true : isSidebarExpanded} appearance="subtle">
              <Sidenav.Header>
                <VStack spacing={12} className="main-layout__sidenav-header">
                  <HStack spacing={12} justifyContent={isSidebarExpanded || isMobile ? 'flex-start' : 'center'}>
                    {isSidebarExpanded || isMobile ? SIDEBAR_BRAND : <SiProtondb size={28} />}
                  </HStack>

                  {isSidebarExpanded || isMobile ? (
                    <InputGroup inside size="sm">
                      <InputGroup.Addon>
                        <SearchIcon />
                      </InputGroup.Addon>
                      <Input placeholder="Filtrar menu" />
                    </InputGroup>
                  ) : null}
                </VStack>
              </Sidenav.Header>

              <Sidenav.Body>
                <Nav activeKey={activeSidebarKey} onSelect={handleSidebarSelect}>
                  {SIDEBAR_ITEMS.map((item) => (
                    <Nav.Item eventKey={item.eventKey} icon={item.icon} key={item.eventKey}>
                      {item.label}
                    </Nav.Item>
                  ))}

                  <Nav.Menu eventKey="parametros" icon={<SettingIcon />} title="Parametros">
                    <Nav.Item eventKey="parametros/boname">Boname</Nav.Item>
                  </Nav.Menu>
                </Nav>
              </Sidenav.Body>

              <Sidenav.Footer>
                {isMobile ? (
                  <div className="main-layout__sidebar-footer">
                    <Button appearance="subtle" block onClick={handleSidebarToggle}>
                      Fechar menu
                    </Button>
                  </div>
                ) : (
                  <Sidenav.Toggle onToggle={setIsSidebarExpanded} />
                )}
              </Sidenav.Footer>
            </Sidenav>
          </Sidebar>
        ) : null}

        {isMobile && isMobileSidebarOpen ? (
          <button
            type="button"
            aria-label="Fechar menu lateral"
            className="main-layout__backdrop"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        ) : null}

        <Container className="main-layout__content-shell">
          <Content className="main-layout__content">
            <VStack spacing={20} className="main-layout__content-stack">
              {!hidePageChrome ? (
                <HStack
                  justifyContent="space-between"
                  alignItems="flex-start"
                  className="main-layout__content-topbar"
                >
                  <VStack spacing={6} alignItems="flex-start">
                    <Breadcrumb>
                      {breadcrumbItems.slice(0, -1).map((item) => (
                        <Breadcrumb.Item key={item}>{item}</Breadcrumb.Item>
                      ))}
                      <Breadcrumb.Item active>{breadcrumbItems[breadcrumbItems.length - 1] ?? pageTitle}</Breadcrumb.Item>
                    </Breadcrumb>
                    <div className="main-layout__content-copy">
                      <h2>{pageTitle}</h2>
                      {pageDescription ? <p>{pageDescription}</p> : null}
                    </div>
                  </VStack>

                  {!isMobile ? (
                    <div className="main-layout__overview-card">
                      <Placeholder.Paragraph rows={2} active />
                    </div>
                  ) : null}
                </HStack>
              ) : null}

              {children}
            </VStack>
          </Content>
        </Container>
      </Container>
    </Container>
  )
}

export default MainLayout
