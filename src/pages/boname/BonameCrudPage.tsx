import { useState, useTransition } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Button,
  HStack,
  Input,
  InputGroup,
  InputNumber,
  Pagination,
  Panel,
  SelectPicker,
  useMediaQuery,
} from 'rsuite'
import { Cell, Column, HeaderCell, Table } from 'rsuite-table'
import SearchIcon from '@rsuite/icons/Search'
import ReloadIcon from '@rsuite/icons/Reload'
import PlusIcon from '@rsuite/icons/Plus'
import EditIcon from '@rsuite/icons/Edit'
import TrashIcon from '@rsuite/icons/Trash'
import VisibleIcon from '@rsuite/icons/Visible'
import { AppModal, DataState, PageSection, StatusBadge } from '../../components/ui'
import { getErrorMessage, useAppAlert } from '../../hooks/useAppAlert'
import '../../styles/vendor/rsuite-table.css'
import './BonameCrudPage.css'

export interface BonameRecord {
  bona_id: number
  bona_codigo: string
  bona_descr: string
  bona_qt_ui: number
  bona_diag_id: number
  bona_ativo: 0 | 1
}

interface ApiResponse<T> {
  data: T
  err: number
  msg: string
  status: number
}

type FormErrors = Partial<Record<keyof BonameRecord, string>>
type FormMode = 'create' | 'edit' | 'view'
type StatusFilter = 'active' | 'all' | 'inactive'

export interface BonameCrudPageProps {
  apiBaseUrl?: string
  authToken?: string | null
}

const DEFAULT_FORM_VALUES: BonameRecord = {
  bona_id: 0,
  bona_codigo: '',
  bona_descr: '',
  bona_qt_ui: 0,
  bona_diag_id: 0,
  bona_ativo: 1,
}

const LOCAL_STORAGE_TOKEN_KEYS = ['authToken', 'access_token', 'token', 'jwtToken']

const STATUS_FILTER_OPTIONS = [
  { label: 'Todos os status', value: 'all' },
  { label: 'Somente ativos', value: 'active' },
  { label: 'Somente inativos', value: 'inactive' },
] satisfies Array<{ label: string; value: StatusFilter }>

const PAGE_SIZE_OPTIONS = [
  { label: '10 por pagina', value: 10 },
  { label: '20 por pagina', value: 20 },
  { label: '50 por pagina', value: 50 },
] satisfies Array<{ label: string; value: number }>

function getStoredToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  for (const key of LOCAL_STORAGE_TOKEN_KEYS) {
    const value = window.localStorage.getItem(key)?.trim()

    if (value) {
      return value
    }
  }

  return null
}

function buildUrl(baseUrl: string, path: string): string {
  const normalizedBase = baseUrl.replace(/\/$/, '')
  const normalizedPath = path.replace(/^\//, '')
  return `${normalizedBase}/${normalizedPath}`
}

function normalizeSearchTerm(value: string): string {
  const trimmedValue = value.trim()
  return trimmedValue.length === 0 ? '*' : trimmedValue
}

function toUppercaseValue(value: string): string {
  return value.toLocaleUpperCase('pt-BR')
}

function validateForm(values: BonameRecord): FormErrors {
  const errors: FormErrors = {}

  if (values.bona_id <= 0) {
    errors.bona_id = 'Informe um ID maior que zero.'
  }

  if (!values.bona_codigo.trim()) {
    errors.bona_codigo = 'Informe o codigo do Boname.'
  }

  if (!values.bona_descr.trim()) {
    errors.bona_descr = 'Informe a descricao do Boname.'
  }

  if (values.bona_qt_ui <= 0) {
    errors.bona_qt_ui = 'Informe uma quantidade por unidade maior que zero.'
  }

  if (values.bona_diag_id <= 0) {
    errors.bona_diag_id = 'Informe um ID de diagnostico maior que zero.'
  }

  return errors
}

async function requestBoname<T>(
  baseUrl: string,
  path: string,
  init: RequestInit,
  authToken?: string | null,
): Promise<T> {
  const headers = new Headers(init.headers)

  if (!headers.has('Content-Type') && init.method && init.method !== 'GET') {
    headers.set('Content-Type', 'application/json')
  }

  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`)
  }

  const response = await fetch(buildUrl(baseUrl, path), {
    ...init,
    headers,
  })

  let payload: ApiResponse<T> | null = null

  try {
    payload = (await response.json()) as ApiResponse<T>
  } catch {
    // Non-JSON responses are handled below.
  }

  if (!response.ok || payload?.err) {
    throw new Error(payload?.msg || `Falha ao processar a requisicao (${response.status}).`)
  }

  if (!payload) {
    throw new Error('Resposta vazia do backend.')
  }

  return payload.data
}

async function listarBonames(baseUrl: string, searchTerm: string, authToken?: string | null): Promise<BonameRecord[]> {
  return requestBoname<BonameRecord[]>(
    baseUrl,
    `/parametros/boname/listar/${encodeURIComponent(searchTerm)}`,
    { method: 'GET' },
    authToken,
  )
}

async function buscarBoname(baseUrl: string, bonaId: number, authToken?: string | null): Promise<BonameRecord> {
  return requestBoname<BonameRecord>(
    baseUrl,
    `/parametros/boname/buscar/${bonaId}`,
    { method: 'GET' },
    authToken,
  )
}

async function salvarBoname(baseUrl: string, values: BonameRecord, authToken?: string | null): Promise<void> {
  await requestBoname<unknown>(
    baseUrl,
    '/parametros/boname/salvar',
    {
      method: 'POST',
      body: JSON.stringify(values),
    },
    authToken,
  )
}

async function excluirBoname(baseUrl: string, bonaId: number, authToken?: string | null): Promise<void> {
  await requestBoname<unknown>(
    baseUrl,
    `/parametros/boname/excluir/${bonaId}`,
    { method: 'DELETE' },
    authToken,
  )
}

export function BonameCrudPage({
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  authToken,
}: BonameCrudPageProps) {
  const [isCompactLayout] = useMediaQuery('(max-width: 768px)')
  const resolvedAuthToken = authToken ?? getStoredToken()
  const alert = useAppAlert()
  const queryClient = useQueryClient()
  const [searchValue, setSearchValue] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('*')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [pageSize, setPageSize] = useState(10)
  const [activePage, setActivePage] = useState(1)
  const [isSearchPending, startSearchTransition] = useTransition()
  const [modalMode, setModalMode] = useState<FormMode | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<BonameRecord | null>(null)
  const [formValues, setFormValues] = useState<BonameRecord>(DEFAULT_FORM_VALUES)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isFormLoading, setIsFormLoading] = useState(false)

  const listQuery = useQuery({
    queryKey: ['boname-list', apiBaseUrl, submittedSearch, resolvedAuthToken],
    queryFn: () => listarBonames(apiBaseUrl, submittedSearch, resolvedAuthToken),
  })

  const saveMutation = useMutation({
    mutationFn: (values: BonameRecord) => salvarBoname(apiBaseUrl, values, resolvedAuthToken),
    onSuccess: async () => {
      alert.success('Boname salvo', 'Registro atualizado com sucesso.')
      setModalMode(null)
      await queryClient.invalidateQueries({ queryKey: ['boname-list'] })
    },
    onError: (error: Error) => {
      alert.error('Erro ao salvar Boname', getErrorMessage(error))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (bonaId: number) => excluirBoname(apiBaseUrl, bonaId, resolvedAuthToken),
    onSuccess: async () => {
      alert.success('Boname excluido', 'Registro removido com sucesso.')
      setDeleteCandidate(null)
      await queryClient.invalidateQueries({ queryKey: ['boname-list'] })
    },
    onError: (error: Error) => {
      alert.error('Erro ao excluir Boname', getErrorMessage(error))
    },
  })

  const records = listQuery.data ?? []
  const filteredRecords = records.filter((record) => {
    if (statusFilter === 'all') {
      return true
    }

    return statusFilter === 'active' ? record.bona_ativo === 1 : record.bona_ativo === 0
  })
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize))
  const currentPage = Math.min(activePage, totalPages)
  const pageStart = (currentPage - 1) * pageSize
  const paginatedRecords = filteredRecords.slice(pageStart, pageStart + pageSize)
  const hasData = filteredRecords.length > 0
  const isReadOnly = modalMode === 'view'
  const tableHeight = Math.min(Math.max(paginatedRecords.length * 54 + 104, 260), 560)

  const handleSearch = () => {
    startSearchTransition(() => {
      setSubmittedSearch(normalizeSearchTerm(searchValue))
      setActivePage(1)
    })
  }

  const handleResetSearch = () => {
    setSearchValue('')
    setStatusFilter('all')

    startSearchTransition(() => {
      setSubmittedSearch('*')
      setActivePage(1)
    })
  }

  const closeFormModal = () => {
    setModalMode(null)
    setFormErrors({})
    setIsFormLoading(false)
  }

  const handleOpenCreate = () => {
    setModalMode('create')
    setFormValues(DEFAULT_FORM_VALUES)
    setFormErrors({})
    setIsFormLoading(false)
  }

  const handleOpenRecordModal = async (mode: 'edit' | 'view', record: BonameRecord) => {
    setModalMode(mode)
    setFormErrors({})
    setIsFormLoading(true)

    try {
      const payload = await buscarBoname(apiBaseUrl, record.bona_id, resolvedAuthToken)
      setFormValues(payload)
    } catch (error) {
      alert.error('Erro ao carregar Boname', getErrorMessage(error, 'Falha ao carregar o Boname.'))
      setModalMode(null)
    } finally {
      setIsFormLoading(false)
    }
  }

  const handleSubmit = async () => {
    const nextErrors = validateForm(formValues)
    setFormErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      await alert.message({
        icon: 'warning',
        title: 'Campos obrigatorios',
        text: 'Revise os campos destacados antes de salvar o registro.',
      })
      return
    }

    await saveMutation.mutateAsync({
      ...formValues,
      bona_codigo: formValues.bona_codigo.trim(),
      bona_descr: formValues.bona_descr.trim(),
    })
  }

  const tableLabelStart = hasData ? pageStart + 1 : 0
  const tableLabelEnd = hasData ? pageStart + paginatedRecords.length : 0
  const hasActiveFilters = submittedSearch !== '*' || statusFilter !== 'all'

  const renderRowActions = (rowData: BonameRecord, compact = false) => (
    <HStack spacing={8} wrap className={`boname-page__row-actions ${compact ? 'boname-page__row-actions--compact' : ''}`.trim()}>
      <Button
        appearance="subtle"
        size="xs"
        startIcon={<VisibleIcon />}
        onClick={() => {
          void handleOpenRecordModal('view', rowData)
        }}
      >
        Visualizar
      </Button>
      <Button
        appearance="subtle"
        size="xs"
        startIcon={<EditIcon />}
        onClick={() => {
          void handleOpenRecordModal('edit', rowData)
        }}
      >
        Editar
      </Button>
      <Button
        appearance="subtle"
        color="red"
        size="xs"
        startIcon={<TrashIcon />}
        onClick={() => setDeleteCandidate(rowData)}
      >
        Excluir
      </Button>
    </HStack>
  )

  return (
    <section className="boname-page">
      <PageSection
        title="Filtros e acoes"
        description="Padrao reutilizavel com busca, segmentacao e acoes principais da tela."
        actions={
          <HStack spacing={10} wrap>
            <Button appearance="primary" startIcon={<SearchIcon />} loading={isSearchPending} onClick={handleSearch}>
              Buscar
            </Button>
            <Button appearance="subtle" startIcon={<ReloadIcon />} onClick={handleResetSearch}>
              Limpar
            </Button>
            <Button
              appearance="ghost"
              startIcon={<ReloadIcon />}
              loading={listQuery.isFetching && !listQuery.isPending}
              onClick={() => {
                void listQuery.refetch()
              }}
            >
              Atualizar
            </Button>
            <Button appearance="primary" color="green" startIcon={<PlusIcon />} onClick={handleOpenCreate}>
              Novo Boname
            </Button>
          </HStack>
        }
      >
        <div className="boname-page__filters">
          <div className="boname-page__field boname-page__field--search">
            <label htmlFor="boname-search">Descricao</label>
            <InputGroup inside size="lg">
              <InputGroup.Addon>
                <SearchIcon />
              </InputGroup.Addon>
              <Input
                id="boname-search"
                aria-label="Buscar Boname"
                placeholder="Digite a descricao do Boname"
                value={searchValue}
                onChange={setSearchValue}
                onPressEnter={handleSearch}
              />
            </InputGroup>
          </div>

          <div className="boname-page__field">
            <label htmlFor="boname-status-filter">Status</label>
            <SelectPicker
              id="boname-status-filter"
              block
              cleanable={false}
              data={STATUS_FILTER_OPTIONS}
              searchable={false}
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter((value as StatusFilter) || 'all')
                setActivePage(1)
              }}
            />
          </div>

          <div className="boname-page__field">
            <label htmlFor="boname-page-size">Registros por pagina</label>
            <SelectPicker
              id="boname-page-size"
              block
              cleanable={false}
              data={PAGE_SIZE_OPTIONS}
              searchable={false}
              value={pageSize}
              onChange={(value) => {
                setPageSize(Number(value || 10))
                setActivePage(1)
              }}
            />
          </div>
        </div>

        <div className="boname-page__filter-summary" aria-live="polite">
          <StatusBadge tone={hasActiveFilters ? 'info' : 'neutral'}>
            {hasActiveFilters ? 'Filtros aplicados' : 'Sem filtros adicionais'}
          </StatusBadge>
          <StatusBadge tone="info">
            {filteredRecords.length} registro{filteredRecords.length === 1 ? '' : 's'}
          </StatusBadge>
          {submittedSearch !== '*' ? <StatusBadge tone="neutral">Busca: {submittedSearch}</StatusBadge> : null}
          {statusFilter === 'active' ? <StatusBadge tone="success">Somente ativos</StatusBadge> : null}
          {statusFilter === 'inactive' ? <StatusBadge tone="danger">Somente inativos</StatusBadge> : null}
        </div>

      </PageSection>

      <PageSection
        title="Listagem"
        description="Tabela corporativa com acoes por linha, estados visuais e paginacao."
      >
        {listQuery.isPending ? (
          <DataState
            state="loading"
            title="Carregando Bonames..."
            description="Consultando o endpoint `GET /parametros/boname/listar/:pesq`."
          />
        ) : null}

        {listQuery.isError ? (
          <DataState
            state="error"
            title="Nao foi possivel listar os registros"
            description={listQuery.error instanceof Error ? listQuery.error.message : 'Erro ao listar Bonames.'}
            action={
              <Button appearance="primary" onClick={() => void listQuery.refetch()}>
                Tentar novamente
              </Button>
            }
          />
        ) : null}

        {!listQuery.isPending && !listQuery.isError && !hasData ? (
          <DataState
            state="empty"
            title="Nenhum Boname encontrado"
            description="Ajuste os filtros atuais ou cadastre um novo registro para preencher a tabela."
            action={
              <Button appearance="primary" onClick={handleOpenCreate}>
                Cadastrar Boname
              </Button>
            }
          />
        ) : null}

        {!listQuery.isPending && !listQuery.isError && hasData ? (
          <>
            {isCompactLayout ? (
              <div className="boname-page__card-list">
                {paginatedRecords.map((rowData) => (
                  <Panel bordered key={rowData.bona_id} className="boname-page__record-card">
                    <div className="boname-page__record-card-top">
                      <div>
                        <strong>{rowData.bona_codigo}</strong>
                        <p>{rowData.bona_descr}</p>
                      </div>
                      <StatusBadge tone={rowData.bona_ativo === 1 ? 'success' : 'danger'}>
                        {rowData.bona_ativo === 1 ? 'Ativo' : 'Inativo'}
                      </StatusBadge>
                    </div>

                    <dl className="boname-page__record-meta">
                      <div>
                        <dt>ID</dt>
                        <dd>{rowData.bona_id}</dd>
                      </div>
                      <div>
                        <dt>Qt. UI</dt>
                        <dd>{rowData.bona_qt_ui}</dd>
                      </div>
                      <div>
                        <dt>Diag. ID</dt>
                        <dd>{rowData.bona_diag_id}</dd>
                      </div>
                    </dl>

                    {renderRowActions(rowData, true)}
                  </Panel>
                ))}
              </div>
            ) : (
              <div className="boname-page__table-wrap">
                <Table
                  data={paginatedRecords}
                  height={tableHeight}
                  bordered
                  cellBordered
                  rowHeight={54}
                  headerHeight={52}
                  autoHeight={false}
                >
                  <Column width={88} align="center" fixed>
                    <HeaderCell>ID</HeaderCell>
                    <Cell dataKey="bona_id" />
                  </Column>

                  <Column width={140}>
                    <HeaderCell>Codigo</HeaderCell>
                    <Cell dataKey="bona_codigo" />
                  </Column>

                  <Column flexGrow={1} minWidth={280}>
                    <HeaderCell>Descricao</HeaderCell>
                    <Cell dataKey="bona_descr" />
                  </Column>

                  <Column width={120} align="center">
                    <HeaderCell>Qt. UI</HeaderCell>
                    <Cell dataKey="bona_qt_ui" />
                  </Column>

                  <Column width={140} align="center">
                    <HeaderCell>Diag. ID</HeaderCell>
                    <Cell dataKey="bona_diag_id" />
                  </Column>

                  <Column width={140} align="center">
                    <HeaderCell>Status</HeaderCell>
                    <Cell>
                      {(rowData: BonameRecord) => (
                        <StatusBadge tone={rowData.bona_ativo === 1 ? 'success' : 'danger'}>
                          {rowData.bona_ativo === 1 ? 'Ativo' : 'Inativo'}
                        </StatusBadge>
                      )}
                    </Cell>
                  </Column>

                  <Column width={260} fixed="right">
                    <HeaderCell>Acoes</HeaderCell>
                    <Cell>{(rowData: BonameRecord) => renderRowActions(rowData)}</Cell>
                  </Column>
                </Table>
              </div>
            )}

            <div className="boname-page__table-footer">
              <p>
                Exibindo <strong>{tableLabelStart}</strong> a <strong>{tableLabelEnd}</strong> de{' '}
                <strong>{filteredRecords.length}</strong> registros.
              </p>
              <Pagination
                activePage={currentPage}
                boundaryLinks
                ellipsis
                first
                last
                limit={pageSize}
                layout={['pager']}
                maxButtons={5}
                next
                prev
                total={filteredRecords.length}
                onChangePage={setActivePage}
              />
            </div>
          </>
        ) : null}
      </PageSection>

      <AppModal
        open={modalMode !== null}
        intent={modalMode === 'create' ? 'create' : modalMode === 'edit' ? 'edit' : 'view'}
        title={modalMode === 'create' ? 'Novo Boname' : modalMode === 'edit' ? 'Editar Boname' : 'Visualizar Boname'}
        subtitle={
          modalMode === 'view'
            ? 'Consulta em modo leitura do cadastro selecionado.'
            : 'Formulario padronizado com validacao visual e acoes alinhadas.'
        }
        loading={isFormLoading}
        onClose={closeFormModal}
        size="md"
        footer={
          modalMode === 'view' ? (
            <Button appearance="primary" onClick={closeFormModal}>
              Fechar
            </Button>
          ) : (
            <>
              <Button appearance="primary" loading={saveMutation.isPending} disabled={isFormLoading} onClick={() => void handleSubmit()}>
                Salvar
              </Button>
              <Button appearance="subtle" onClick={closeFormModal}>
                Cancelar
              </Button>
            </>
          )
        }
      >
        <div className="boname-page__form-grid">
          <div className="boname-page__field">
            <label htmlFor="boname-id">ID</label>
            <InputNumber
              id="boname-id"
              min={0}
              className={formErrors.bona_id ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
              value={formValues.bona_id}
              disabled={modalMode === 'edit' || isReadOnly}
              onChange={(value) => {
                setFormValues((current) => ({ ...current, bona_id: Number(value || 0) }))
              }}
            />
            <small>O backend exige `bona_id` informado no salvar.</small>
            {formErrors.bona_id ? <span>{formErrors.bona_id}</span> : null}
          </div>

          <div className="boname-page__field">
            <label htmlFor="boname-codigo">Codigo</label>
            <Input
              id="boname-codigo"
              className={formErrors.bona_codigo ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
              value={formValues.bona_codigo}
              disabled={isReadOnly}
              onChange={(value) => {
                setFormValues((current) => ({ ...current, bona_codigo: toUppercaseValue(value) }))
              }}
            />
            {formErrors.bona_codigo ? <span>{formErrors.bona_codigo}</span> : null}
          </div>

          <div className="boname-page__field boname-page__field--full">
            <label htmlFor="boname-descricao">Descricao</label>
            <Input
              id="boname-descricao"
              as="textarea"
              rows={3}
              className={formErrors.bona_descr ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
              value={formValues.bona_descr}
              disabled={isReadOnly}
              onChange={(value) => {
                setFormValues((current) => ({ ...current, bona_descr: toUppercaseValue(value) }))
              }}
            />
            {formErrors.bona_descr ? <span>{formErrors.bona_descr}</span> : null}
          </div>

          <div className="boname-page__field">
            <label htmlFor="boname-qt-ui">Quantidade por unidade</label>
            <InputNumber
              id="boname-qt-ui"
              min={0}
              className={formErrors.bona_qt_ui ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
              value={formValues.bona_qt_ui}
              disabled={isReadOnly}
              onChange={(value) => {
                setFormValues((current) => ({ ...current, bona_qt_ui: Number(value || 0) }))
              }}
            />
            {formErrors.bona_qt_ui ? <span>{formErrors.bona_qt_ui}</span> : null}
          </div>

          <div className="boname-page__field">
            <label htmlFor="boname-diag-id">Diagnostico ID</label>
            <InputNumber
              id="boname-diag-id"
              min={0}
              className={formErrors.bona_diag_id ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
              value={formValues.bona_diag_id}
              disabled={isReadOnly}
              onChange={(value) => {
                setFormValues((current) => ({ ...current, bona_diag_id: Number(value || 0) }))
              }}
            />
            {formErrors.bona_diag_id ? <span>{formErrors.bona_diag_id}</span> : null}
          </div>

          <div className="boname-page__field boname-page__field--full">
            <label>Status do registro</label>
            <div className="boname-page__status-panel">
              <StatusBadge tone={formValues.bona_ativo === 1 ? 'success' : 'danger'}>
                {formValues.bona_ativo === 1 ? 'Registro ativo' : 'Registro inativo'}
              </StatusBadge>
              {!isReadOnly ? (
                <div className="boname-page__status-actions">
                  <Button
                    appearance={formValues.bona_ativo === 1 ? 'primary' : 'subtle'}
                    size="sm"
                    onClick={() => setFormValues((current) => ({ ...current, bona_ativo: 1 }))}
                  >
                    Ativar
                  </Button>
                  <Button
                    appearance={formValues.bona_ativo === 0 ? 'primary' : 'subtle'}
                    color={formValues.bona_ativo === 0 ? 'red' : undefined}
                    size="sm"
                    onClick={() => setFormValues((current) => ({ ...current, bona_ativo: 0 }))}
                  >
                    Inativar
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </AppModal>

      <AppModal
        open={Boolean(deleteCandidate)}
        intent="delete"
        title="Confirmar exclusao"
        subtitle="A acao abaixo afeta diretamente o cadastro selecionado."
        onClose={() => setDeleteCandidate(null)}
        size="sm"
        footer={
          <>
            <Button
              appearance="primary"
              color="red"
              loading={deleteMutation.isPending}
              onClick={() => {
                if (deleteCandidate) {
                  void deleteMutation.mutateAsync(deleteCandidate.bona_id)
                }
              }}
            >
              Excluir registro
            </Button>
            <Button appearance="subtle" onClick={() => setDeleteCandidate(null)}>
              Cancelar
            </Button>
          </>
        }
      >
        <div className="boname-page__confirm-card">
          <p>
            Esta acao remove o cadastro <strong>{deleteCandidate?.bona_descr}</strong> e deve ser usada
            apenas quando houver certeza sobre a exclusao.
          </p>
          {deleteCandidate ? (
            <dl className="boname-page__confirm-grid">
              <div>
                <dt>ID</dt>
                <dd>{deleteCandidate.bona_id}</dd>
              </div>
              <div>
                <dt>Codigo</dt>
                <dd>{deleteCandidate.bona_codigo}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{deleteCandidate.bona_ativo === 1 ? 'Ativo' : 'Inativo'}</dd>
              </div>
            </dl>
          ) : null}
        </div>
      </AppModal>
    </section>
  )
}

export default BonameCrudPage
