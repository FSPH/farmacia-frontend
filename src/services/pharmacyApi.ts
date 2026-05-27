import { apiDelete, apiGet, apiPost } from './api'

export type RequisitionStatus = 'todos' | 'pendentes' | 'aprovadas'
export type StockAlertFilter = 'todos' | 'critico' | 'vencendo' | 'vencido'
export type InventoryStatusFilter = 'todos' | 'abertos' | 'fechados'
export type SupportEntityKey =
  | 'tipos-medicamentos'
  | 'diagnosticos'
  | 'boname'
  | 'medicamentos'
  | 'depositos'
  | 'locais'
  | 'tipos-requisicoes'

export type RequisitionRow = {
  id: number
  data: string
  tipo_codigo: string
  tipo_descr: string
  paciente: string | null
  local_descr: string | null
  deposito_descr: string | null
  medicamento: string
  unidade: string
  med_id: number
  lote: string
  quantidade: number
  aprovado: 0 | 1
  paciente_id: number | null
  deposito_id: number
  local_id: number
  req_solicitado_por: string | null
  req_aprovado_por: string | null
}

export type StockRow = {
  est_id: number
  est_dep_id: number
  dep_descr: string
  est_med_id: number
  med_descr: string
  med_descr_coml: string | null
  med_und: string
  med_tipo_codigo: string
  med_min: number | null
  med_alert: number | null
  est_lote: string
  est_saldo: number
  est_validade: string
  dias_para_vencer: number
}

export type StockAlerts = {
  criticos: StockRow[]
  vencendo: StockRow[]
  vencidos: StockRow[]
}

export type InventorySummary = {
  inv_id: number
  inv_date: string
  inv_dep_id: number
  inv_med_tipo_codigo: string
  inv_status: 0 | 1
  inv_mes_ref: number
  inv_ano_ref: number
  dep_descr: string
  tipo_descr: string
  total_itens: number
  total_itens_divergentes: number
}

export type InventoryItem = {
  iti_id: number
  iti_inv_id: number
  iti_med_id: number
  iti_lote: string
  iti_validade: string
  iti_qtde_estoque: number
  iti_qtde_invent: number
  iti_qtde_dif: number
  med_descr: string
  med_descr_coml: string | null
  med_und: string
}

export type TipoMedicamentoRow = {
  tipo_id: number
  tipo_codigo: string
  tipo_descr: string
  tipo_ativo: 0 | 1
}

export type DiagnosticoRow = {
  diag_id: number
  diag_descr: string
  diag_ativo: 0 | 1
}

export type BonameRow = {
  bona_id: number
  bona_codigo: string
  bona_descr: string
  bona_qt_ui: number
  bona_diag_id: number
  bona_ativo: 0 | 1
}

export type MedicamentoRow = {
  med_id: number
  med_codigo?: string
  med_descr: string
  med_descr_coml: string
  med_und: string
  med_tipo_codigo: string
  med_tipo_med: string
  med_max: number
  med_min: number
  med_ui_cx: number
  med_bona_codigo: string
  med_alert: number
  med_diag_id: number
  med_ativo: 0 | 1
}

export type DepositoRow = {
  dep_id: number
  dep_descr: string
  dep_ativo: 0 | 1
}

export type LocalRow = {
  local_id: number
  local_descr: string
  local_ativo: 0 | 1
}

export type TipoRequisicaoRow = {
  tip_id: number
  tip_codigo: string
  tip_descr: string
}

export type SupportEntityMap = {
  'tipos-medicamentos': TipoMedicamentoRow
  diagnosticos: DiagnosticoRow
  boname: BonameRow
  medicamentos: MedicamentoRow
  depositos: DepositoRow
  locais: LocalRow
  'tipos-requisicoes': TipoRequisicaoRow
}

type ListRequisitionsParams = {
  dataInicio: string
  dataFim: string
  status: RequisitionStatus
}

type ListStockParams = {
  q: string
  alerta: StockAlertFilter
}

type ListInventoriesParams = {
  status: InventoryStatusFilter
}

function mapRequisitionStatus(status: RequisitionStatus) {
  if (status === 'aprovadas') {
    return 1
  }

  if (status === 'pendentes') {
    return 0
  }

  return undefined
}

function mapInventoryStatus(status: InventoryStatusFilter) {
  if (status === 'abertos') {
    return 0
  }

  if (status === 'fechados') {
    return 1
  }

  return undefined
}

export function listRequisitions(params: ListRequisitionsParams) {
  return apiGet<RequisitionRow[]>('/requisicoes', {
    dataInicio: params.dataInicio,
    dataFim: params.dataFim,
    aprova: mapRequisitionStatus(params.status),
  })
}

export function listStock(params: ListStockParams) {
  return apiGet<StockRow[]>('/estoque', {
    q: params.q || '*',
    alerta: params.alerta === 'todos' ? undefined : params.alerta,
  })
}

export function getStockAlerts() {
  return apiGet<StockAlerts>('/estoque/alertas')
}

export function listInventories(params: ListInventoriesParams) {
  return apiGet<InventorySummary[]>('/inventarios', {
    status: mapInventoryStatus(params.status),
  })
}

export function listInventoryItems(inventoryId: number) {
  return apiGet<InventoryItem[]>(`/inventarios/${inventoryId}/itens`)
}

export async function listSupportRows<K extends SupportEntityKey>(
  entity: K,
  search = '*',
): Promise<SupportEntityMap[K][]> {
  switch (entity) {
    case 'tipos-medicamentos':
      return apiGet<SupportEntityMap[K][]>(`/tipos-medicamentos/listar/${search}`)
    case 'diagnosticos':
      return apiGet<SupportEntityMap[K][]>(`/diagnosticos/listar/${search}`)
    case 'boname':
      return apiGet<SupportEntityMap[K][]>(`/boname/listar/${search}`)
    case 'medicamentos':
      return apiGet<SupportEntityMap[K][]>(`/medicamentos/listar/${search}`)
    case 'depositos':
      return apiGet<SupportEntityMap[K][]>(`/depositos/listar/${search}`)
    case 'locais':
      return apiGet<SupportEntityMap[K][]>(`/locais/listar/${search}`)
    case 'tipos-requisicoes':
      return apiGet<SupportEntityMap[K][]>('/tipos-requisicoes/listar')
  }
}

export async function saveSupportRow<K extends SupportEntityKey>(
  entity: K,
  payload: Record<string, unknown>,
) {
  switch (entity) {
    case 'tipos-medicamentos':
      return apiPost(`/tipos-medicamentos/salvar`, payload)
    case 'diagnosticos':
      return apiPost(`/diagnosticos/salvar`, payload)
    case 'boname':
      return apiPost(`/boname/salvar`, payload)
    case 'medicamentos':
      return apiPost(`/medicamentos/salvar`, payload)
    case 'depositos':
      return apiPost(`/depositos/salvar`, payload)
    case 'locais':
      return apiPost(`/locais/salvar`, payload)
    case 'tipos-requisicoes':
      throw new Error('Tipos de requisicao estao disponiveis apenas para consulta.')
  }
}

export async function deleteSupportRow(entity: Exclude<SupportEntityKey, 'tipos-requisicoes'>, id: number) {
  switch (entity) {
    case 'tipos-medicamentos':
      return apiDelete(`/tipos-medicamentos/excluir/${id}`)
    case 'diagnosticos':
      return apiDelete(`/diagnosticos/excluir/${id}`)
    case 'boname':
      return apiDelete(`/boname/excluir/${id}`)
    case 'medicamentos':
      return apiDelete(`/medicamentos/excluir/${id}`)
    case 'depositos':
      return apiDelete(`/depositos/excluir/${id}`)
    case 'locais':
      return apiDelete(`/locais/excluir/${id}`)
  }
}
