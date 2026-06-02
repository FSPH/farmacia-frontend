import type { ReactElement } from 'react'
import type { IconProps } from '@rsuite/icons/Icon'
import {
  RiArchiveDrawerLine,
  RiDashboardLine,
  RiFileList3Line,
  RiMedicineBottleLine,
  RiTeamLine,
} from 'react-icons/ri'

export type SectionKey = 'inicio' | 'pacientes' | 'estoque' | 'requisicoes' | 'parametros/boname'

export type SectionMeta = {
  breadcrumbItems: string[]
  description: string
  status: string
  title: string
}

export type NavigationItem = {
  badge?: string
  eventKey: SectionKey
  icon: ReactElement<IconProps>
  label: string
}

export type NavigationGroup = {
  items: NavigationItem[]
  title: string
}

export const APP_SECTIONS: Record<SectionKey, SectionMeta> = {
  inicio: {
    breadcrumbItems: ['Inicio', 'Workspace', 'Dashboard'],
    description: 'Painel operacional com atalhos, indicadores e padroes visuais para os modulos do sistema.',
    status: 'Workspace ativo',
    title: 'Dashboard corporativo',
  },
  pacientes: {
    breadcrumbItems: ['Inicio', 'Operacao', 'Pacientes'],
    description: 'Espaco reservado para fluxos de atendimento, historico e acompanhamento ambulatorial.',
    status: 'Modulo planejado',
    title: 'Pacientes',
  },
  estoque: {
    breadcrumbItems: ['Inicio', 'Operacao', 'Estoque'],
    description: 'Base pronta para consultas de saldo, lotes, alertas e movimentacoes com foco operacional.',
    status: 'Modulo planejado',
    title: 'Estoque',
  },
  requisicoes: {
    breadcrumbItems: ['Inicio', 'Operacao', 'Requisicoes'],
    description: 'Ambiente preparado para aprovacoes, analise de filas e rastreabilidade das solicitacoes.',
    status: 'Modulo planejado',
    title: 'Requisicoes',
  },
  'parametros/boname': {
    breadcrumbItems: ['Inicio', 'Cadastros', 'Boname'],
    description: 'Tela padronizada para consulta, cadastro, edicao e visualizacao dos parametros de Boname.',
    status: 'Cadastro mestre',
    title: 'Cadastro de Boname',
  },
}

export const NAVIGATION_GROUPS: NavigationGroup[] = [
  {
    title: 'Visao geral',
    items: [
      {
        eventKey: 'inicio',
        icon: <RiDashboardLine size={18} />,
        label: 'Dashboard',
      },
    ],
  },
  {
    title: 'Operacao',
    items: [
      {
        eventKey: 'pacientes',
        icon: <RiTeamLine size={18} />,
        label: 'Pacientes',
      },
      {
        eventKey: 'estoque',
        icon: <RiArchiveDrawerLine size={18} />,
        label: 'Estoque',
      },
      {
        badge: '3',
        eventKey: 'requisicoes',
        icon: <RiFileList3Line size={18} />,
        label: 'Requisicoes',
      },
    ],
  },
  {
    title: 'Cadastros',
    items: [
      {
        badge: 'novo',
        eventKey: 'parametros/boname',
        icon: <RiMedicineBottleLine size={18} />,
        label: 'Boname',
      },
    ],
  },
]

export const QUICK_ACTIONS: Array<{ eventKey: SectionKey; label: string }> = [
  { eventKey: 'inicio', label: 'Abrir dashboard' },
  { eventKey: 'parametros/boname', label: 'Abrir cadastro de Boname' },
  { eventKey: 'requisicoes', label: 'Consultar requisicoes' },
  { eventKey: 'estoque', label: 'Ver resumo de estoque' },
]
