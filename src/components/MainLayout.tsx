import { useEffect, useState, type ReactNode } from 'react'
import {
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Container,
  Content,
  Header,
  HStack,
  IconButton,
  Nav,
  Panel,
  Popover,
  Sidebar,
  Sidenav,
  Tooltip,
  VStack,
  Whisper,
  useMediaQuery,
} from 'rsuite'
import {
  RiAddLine,
  RiCloseLine,
  RiMenuLine,
  RiNotification3Line,
  RiShieldCrossLine,
} from 'react-icons/ri'
import logoFull from '../assets/img/logo_full.jpeg'
import logoSimple from '../assets/img/logo_simple.jpeg'
import menuIcon from '../assets/img/menu.svg'
import { NAVIGATION_GROUPS, type SectionKey } from '../config/navigation'
import './MainLayout.css'

const SIDEBAR_EXPANDED = 280
const SIDEBAR_COLLAPSED = 88
const OVERVIEW_GROUP = 'Visao geral'

const SIDEBAR_SECTION_KEYS = new Set<SectionKey>(
  NAVIGATION_GROUPS.flatMap((group) => group.items.map((item) => item.eventKey))
)

const getMenuEventKey = (groupTitle: string) => `menu-${groupTitle.toLowerCase().replace(/\s+/g, '-')}`

const SECTION_MENU_MAP: Partial<Record<SectionKey, string>> = NAVIGATION_GROUPS.reduce((map, group) => {
  if (group.title === OVERVIEW_GROUP) {
    return map
  }

  const menuEventKey = getMenuEventKey(group.title)

  group.items.forEach((item) => {
    map[item.eventKey] = menuEventKey
  })

  return map
}, {} as Partial<Record<SectionKey, string>>)

export interface MainLayoutProps {
  activeSidebarKey: SectionKey
  breadcrumbItems?: string[]
  children: ReactNode
  onQuickActionSelect?: (eventKey: SectionKey) => void
  onSidebarSelect?: (eventKey: SectionKey) => void
  pageBannerCompact?: boolean
  pageDescription?: string
  pageMetaVisible?: boolean
  pageStatus?: string
  pageTitle?: string
  quickActions?: Array<{ eventKey: SectionKey; label: string }>
}

const NOTIFICATIONS = [
  {
    title: 'Aprovacoes pendentes',
    description: 'Existem requisicoes aguardando priorizacao no modulo operacional.',
  },
  {
    title: 'Padrao visual atualizado',
    description: 'Shell corporativo aplicado e pronto para os proximos modulos.',
  },
  {
    title: 'Integracao de Boname',
    description: 'CRUD principal preparado com estados de carregamento, vazio e erro.',
  },
]

export function MainLayout({
  activeSidebarKey,
  breadcrumbItems = ['Inicio', 'Workspace', 'Dashboard'],
  children,
  onQuickActionSelect,
  onSidebarSelect,
  pageBannerCompact = false,
  pageDescription = 'Workspace corporativo preparado para os modulos da farmacia ambulatorial.',
  pageMetaVisible = true,
  pageStatus = 'Operacao ativa',
  pageTitle = 'Dashboard corporativo',
  quickActions = [],
}: MainLayoutProps) {
  const [isMobile] = useMediaQuery('(max-width: 991px)')
  const [isCompactMobile] = useMediaQuery('(max-width: 480px)')
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const sidebarWidth = isMobile
    ? SIDEBAR_EXPANDED
    : isSidebarExpanded
      ? SIDEBAR_EXPANDED
      : SIDEBAR_COLLAPSED

  const isSidebarVisible = !isMobile || isMobileSidebarOpen
  const showSidebarLabels = isSidebarExpanded || isMobile
  const activeMenuKey = SECTION_MENU_MAP[activeSidebarKey]
  const [openMenuKeys, setOpenMenuKeys] = useState<string[]>(activeMenuKey ? [activeMenuKey] : [])
  const headerStyle = isMobile ? undefined : { left: sidebarWidth }

  useEffect(() => {
    if (!activeMenuKey) return
    setOpenMenuKeys((currentKeys) => (currentKeys.includes(activeMenuKey) ? currentKeys : [activeMenuKey]))
  }, [activeMenuKey])

  const handleSidebarSelect = (eventKey: string | number | undefined) => {
    if (typeof eventKey !== 'string' || !SIDEBAR_SECTION_KEYS.has(eventKey as SectionKey) || !onSidebarSelect) {
      return
    }

    onSidebarSelect(eventKey as SectionKey)

    if (isMobile) {
      setIsMobileSidebarOpen(false)
    }
  }

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileSidebarOpen((currentValue) => !currentValue)
      return
    }

    setIsSidebarExpanded((currentValue) => !currentValue)
  }

  const quickActionsSpeaker = (
    <Popover className="main-layout__notifications-popover">
      <VStack spacing={10} alignItems="stretch">
        {quickActions.map((action) => (
          <Button
            appearance="subtle"
            className="main-layout__quick-action"
            key={action.eventKey}
            onClick={() => onQuickActionSelect?.(action.eventKey)}
          >
            {action.label}
          </Button>
        ))}
      </VStack>
    </Popover>
  )

  return (
    <Container className="main-layout">
      <Header className="main-layout__header" style={headerStyle}>
        <HStack justifyContent="space-between" alignItems="center" className="main-layout__header-row">
          <HStack spacing={14} alignItems="center" className="main-layout__header-brand">
            {isMobile ? (
              <IconButton
                appearance="subtle"
                circle
                aria-label={isSidebarVisible ? 'Alternar menu lateral' : 'Abrir menu lateral'}
                icon={isSidebarVisible ? <RiCloseLine size={18} /> : <RiMenuLine size={18} />}
                onClick={toggleSidebar}
              />
            ) : null}

            <div className="main-layout__brand-lockup">
              <div className="main-layout__brand-mark">
                <RiShieldCrossLine size={18} />
              </div>
              <VStack spacing={2} alignItems="flex-start">
                <strong>Farmacia Ambulatorial</strong>
                <span>Workspace web corporativo</span>
              </VStack>
            </div>
          </HStack>

          <HStack spacing={12} alignItems="center" className="main-layout__header-actions">
            <Whisper
              placement="bottomEnd"
              trigger="click"
              speaker={
                <Popover className="main-layout__notifications-popover">
                  <VStack spacing={14} alignItems="stretch">
                    {NOTIFICATIONS.map((notification) => (
                      <div className="main-layout__notification" key={notification.title}>
                        <strong>{notification.title}</strong>
                        <p>{notification.description}</p>
                      </div>
                    ))}
                  </VStack>
                </Popover>
              }
            >
              <Badge content={NOTIFICATIONS.length}>
                <IconButton
                  appearance="subtle"
                  circle
                  aria-label="Notificacoes"
                  icon={<RiNotification3Line size={18} />}
                />
              </Badge>
            </Whisper>

            <Whisper placement="bottomEnd" trigger="click" speaker={quickActionsSpeaker}>
              <Button appearance="primary" startIcon={<RiAddLine size={16} />}>
                {isCompactMobile ? 'Acoes' : 'Acoes rapidas'}
              </Button>
            </Whisper>

            <div className="main-layout__user-chip">
              <Avatar circle size="sm" style={{ background: '#1d4ed8' }}>
                GO
              </Avatar>
              <VStack spacing={2} alignItems="flex-start">
                <strong>Gustavo Oliveira</strong>
                <span>Frontend senior</span>
              </VStack>
            </div>
          </HStack>
        </HStack>
      </Header>

      <Container className="main-layout__frame">
        {isSidebarVisible ? (
          <Sidebar
            width={sidebarWidth}
            className={`main-layout__sidebar ${isMobile ? 'main-layout__sidebar--mobile' : ''} ${
              showSidebarLabels ? 'main-layout__sidebar--expanded' : 'main-layout__sidebar--collapsed'
            }`.trim()}
            style={{ top: 0 }}
          >
            <div className="main-layout__sidebar-inner">
              <div className="main-layout__sidebar-top">
                <img
                  src={showSidebarLabels ? logoFull : logoSimple}
                  alt="Farmacia Ambulatorial"
                  className="main-layout__sidebar-logo"
                />
                <IconButton
                  appearance="subtle"
                  circle
                  aria-label="Alternar menu lateral"
                  className="main-layout__sidebar-toggle"
                  icon={
                    <img
                      src={menuIcon}
                      alt=""
                      aria-hidden
                      className={`main-layout__sidebar-toggle-icon ${
                        showSidebarLabels ? '' : 'main-layout__sidebar-toggle-icon--collapsed'
                      }`.trim()}
                    />
                  }
                  onClick={toggleSidebar}
                />
              </div>
              <div className="main-layout__sidebar-groups">
                <Sidenav
                  key={activeMenuKey ?? 'overview'}
                  appearance="subtle"
                  expanded={showSidebarLabels}
                  className="main-layout__sidenav"
                  openKeys={openMenuKeys}
                  onOpenChange={(nextOpenKeys) => setOpenMenuKeys(nextOpenKeys as string[])}
                >
                  <Sidenav.Body>
                    <Nav
                      appearance="subtle"
                      className="main-layout__nav"
                      activeKey={activeSidebarKey}
                      onSelect={handleSidebarSelect}
                    >
                      {NAVIGATION_GROUPS.map((group) => {
                        if (group.title === OVERVIEW_GROUP) {
                          return group.items.map((item) => (
                            <Nav.Item eventKey={item.eventKey} key={item.eventKey}>
                              <div className="main-layout__nav-item-shell" title={item.label}>
                                <span className="main-layout__nav-item-icon">{item.icon}</span>
                                {showSidebarLabels ? (
                                  <div className="main-layout__nav-item-label">
                                    <span>{item.label}</span>
                                    {item.badge ? (
                                      <small className="main-layout__nav-item-badge">{item.badge}</small>
                                    ) : null}
                                  </div>
                                ) : null}
                              </div>
                            </Nav.Item>
                          ))
                        }

                        if (!showSidebarLabels) {
                          return group.items.map((item) => (
                            <Nav.Item eventKey={item.eventKey} key={item.eventKey}>
                              <Whisper
                                trigger="hover"
                                placement="right"
                                speaker={<Tooltip>{item.label}</Tooltip>}
                              >
                                <div className="main-layout__nav-item-shell" title={item.label}>
                                  <span className="main-layout__nav-item-icon">{item.icon}</span>
                                </div>
                              </Whisper>
                            </Nav.Item>
                          ))
                        }

                        return (
                          <Nav.Menu
                            eventKey={getMenuEventKey(group.title)}
                            key={group.title}
                            trigger={showSidebarLabels ? 'hover' : 'click'}
                            placement={showSidebarLabels ? undefined : 'rightStart'}
                            title={
                              <div className="main-layout__nav-menu-title">
                                <span className="main-layout__nav-item-icon">{group.items[0]?.icon}</span>
                                {showSidebarLabels ? <span>{group.title}</span> : null}
                              </div>
                            }
                          >
                            {group.items.map((item) => (
                              <Nav.Item eventKey={item.eventKey} key={item.eventKey}>
                                <div className="main-layout__nav-item-shell" title={item.label}>
                                  <span className="main-layout__nav-item-icon">{item.icon}</span>
                                  <div className="main-layout__nav-item-label">
                                    <span>{item.label}</span>
                                    {item.badge ? <small className="main-layout__nav-item-badge">{item.badge}</small> : null}
                                  </div>
                                </div>
                              </Nav.Item>
                            ))}
                          </Nav.Menu>
                        )
                      })}
                    </Nav>
                  </Sidenav.Body>
                </Sidenav>
              </div>
            </div>
          </Sidebar>
        ) : null}

        {isMobile && isMobileSidebarOpen ? (
          <button
            type="button"
            aria-label="Fechar navegacao lateral"
            className="main-layout__backdrop"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        ) : null}

        <Container className="main-layout__content-shell">
          <Content className="main-layout__content">
            <div className="main-layout__content-stack">
              <Panel
                bordered
                className={`main-layout__page-banner ${pageBannerCompact ? 'main-layout__page-banner--compact' : ''}`.trim()}
              >
                <div className="main-layout__page-banner-grid">
                  <VStack spacing={8} alignItems="flex-start" className="main-layout__page-copy">
                    <Breadcrumb>
                      {breadcrumbItems.slice(0, -1).map((item) => (
                        <Breadcrumb.Item key={item}>{item}</Breadcrumb.Item>
                      ))}
                      <Breadcrumb.Item active>{breadcrumbItems[breadcrumbItems.length - 1] ?? pageTitle}</Breadcrumb.Item>
                    </Breadcrumb>
                    <div>
                      <h1>{pageTitle}</h1>
                      <p>{pageDescription}</p>
                    </div>
                  </VStack>

                  {pageMetaVisible ? (
                    <div className="main-layout__page-meta">
                      <div>
                        <span>Status</span>
                        <strong>{pageStatus}</strong>
                      </div>
                      <div>
                        <span>Padrao</span>
                        <strong>RSuite + componentes reutilizaveis</strong>
                      </div>
                    </div>
                  ) : null}
                </div>
              </Panel>

              <div className="main-layout__page-body">{children}</div>
            </div>
          </Content>
        </Container>
      </Container>
    </Container>
  )
}

export default MainLayout
