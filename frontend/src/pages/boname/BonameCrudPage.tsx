import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Button,
  HStack,
  Input,
  InputNumber,
  Pagination,
  Panel,
  SelectPicker,
  Textarea,
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

interface DiagnosticoRecord {
  diag_id: number
  diag_descr: string
  diag_ativo: 0 | 1
}

interface DiagnosticoOption {
  label: string
  value: number
}

interface ApiResponse<T> {
  data: T
  err: number
  msg: string
  status: number
}

type FormErrors = Partial<Record<keyof BonameRecord, string>>
type FormMode = 'create' | 'edit' | 'view'

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

const PAGE_SIZE = 11
const BONAME_DESCR_MAX_LENGTH = 150

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

function normalizeBonameDescription(value: string): string {
  return value.slice(0, BONAME_DESCR_MAX_LENGTH)
}

function normalizeBonameDescriptionForSave(value: string): string {
  return toUppercaseValue(normalizeBonameDescription(value))
}

function validateForm(values: BonameRecord): FormErrors {
  const errors: FormErrors = {}

  if (!values.bona_codigo.trim()) {
    errors.bona_codigo = 'Informe o codigo do Boname.'
  }

  if (!values.bona_descr.trim()) {
    errors.bona_descr = 'Informe a descricao do Boname.'
  } else if (values.bona_descr.length > BONAME_DESCR_MAX_LENGTH) {
    errors.bona_descr = `A descricao deve ter no maximo ${BONAME_DESCR_MAX_LENGTH} caracteres.`
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

async function listarDiagnosticosAtivos(baseUrl: string, authToken?: string | null): Promise<DiagnosticoRecord[]> {
  return requestBoname<DiagnosticoRecord[]>(
    baseUrl,
    '/parametros/diagnosticos/listar_ativos/*',
    { method: 'GET' },
    authToken,
  )
}

async function buscarDiagnostico(baseUrl: string, diagId: number, authToken?: string | null): Promise<DiagnosticoRecord> {
  return requestBoname<DiagnosticoRecord>(
    baseUrl,
    `/parametros/diagnosticos/buscar/${diagId}`,
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
  const formRequestIdRef = useRef(0)
  const [searchValue, setSearchValue] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('*')
  const [activePage, setActivePage] = useState(1)
  const [modalMode, setModalMode] = useState<FormMode | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<BonameRecord | null>(null)
  const [formValues, setFormValues] = useState<BonameRecord>(DEFAULT_FORM_VALUES)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isFormLoading, setIsFormLoading] = useState(false)

  const listQuery = useQuery({
    queryKey: ['boname-list', apiBaseUrl, submittedSearch, resolvedAuthToken],
    queryFn: () => listarBonames(apiBaseUrl, submittedSearch, resolvedAuthToken),
  })

  const diagnosticosQuery = useQuery({
    queryKey: ['diagnosticos-ativos', apiBaseUrl, resolvedAuthToken],
    queryFn: () => listarDiagnosticosAtivos(apiBaseUrl, resolvedAuthToken),
    enabled: modalMode !== null,
  })

  const selectedDiagnosticoQuery = useQuery({
    queryKey: ['diagnostico-modal', apiBaseUrl, formValues.bona_diag_id, resolvedAuthToken],
    queryFn: () => buscarDiagnostico(apiBaseUrl, formValues.bona_diag_id, resolvedAuthToken),
    enabled: modalMode !== null && formValues.bona_diag_id > 0,
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
  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE))
  const currentPage = Math.min(activePage, totalPages)
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const paginatedRecords = records.slice(pageStart, pageStart + PAGE_SIZE)
  const hasData = records.length > 0
  const isReadOnly = modalMode === 'view'
  const tableHeight = Math.min(Math.max(paginatedRecords.length * 54 + 104, 260), 560)

  const handleSearch = () => {
    setSubmittedSearch(normalizeSearchTerm(searchValue))
    setActivePage(1)
  }

  const closeFormModal = () => {
    formRequestIdRef.current += 1
    setModalMode(null)
    setFormValues(DEFAULT_FORM_VALUES)
    setFormErrors({})
    setIsFormLoading(false)
  }

  const handleOpenCreate = () => {
    formRequestIdRef.current += 1
    setModalMode('create')
    setFormValues(DEFAULT_FORM_VALUES)
    setFormErrors({})
    setIsFormLoading(false)
  }

  const handleOpenRecordModal = async (mode: 'edit' | 'view', record: BonameRecord) => {
    const requestId = formRequestIdRef.current + 1
    formRequestIdRef.current = requestId
    setModalMode(mode)
    setFormErrors({})
    setIsFormLoading(true)

    try {
      const payload = await buscarBoname(apiBaseUrl, record.bona_id, resolvedAuthToken)
      if (formRequestIdRef.current !== requestId) {
        return
      }

      setFormValues(payload)
    } catch (error) {
      if (formRequestIdRef.current !== requestId) {
        return
      }

      alert.error('Erro ao carregar Boname', getErrorMessage(error, 'Falha ao carregar o Boname.'))
      setModalMode(null)
    } finally {
      if (formRequestIdRef.current === requestId) {
        setIsFormLoading(false)
      }
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
      bona_descr: normalizeBonameDescriptionForSave(formValues.bona_descr).trim(),
    })
  }

  const tableLabelStart = hasData ? pageStart + 1 : 0
  const tableLabelEnd = hasData ? pageStart + paginatedRecords.length : 0
  const diagnosticoOptions: DiagnosticoOption[] = (diagnosticosQuery.data ?? []).map((diagnostico) => ({
    label: diagnostico.diag_descr,
    value: diagnostico.diag_id,
  }))
  const selectedDiagnostico = selectedDiagnosticoQuery.data

  if (
    selectedDiagnostico &&
    !diagnosticoOptions.some((diagnostico) => diagnostico.value === selectedDiagnostico.diag_id)
  ) {
    diagnosticoOptions.push({
      label:
        selectedDiagnostico.diag_ativo === 1
          ? selectedDiagnostico.diag_descr
          : `${selectedDiagnostico.diag_descr} (inativo)`,
      value: selectedDiagnostico.diag_id,
    })
  }

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
        className="boname-page__table-section"
        actions={
          <div className="boname-page__toolbar">
            <Input
              aria-label="Buscar Boname por descricao"
              className="boname-page__search-input"
              placeholder="Buscar por descricao"
              value={searchValue}
              onChange={setSearchValue}
              onPressEnter={handleSearch}
            />
            <HStack spacing={10} wrap>
              <Button appearance="primary" startIcon={<SearchIcon />} onClick={handleSearch}>
                Buscar
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
          </div>
        }
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
            description="Cadastre um novo registro para preencher a tabela."
            action={
              <Button appearance="primary" onClick={handleOpenCreate}>
                Cadastrar Boname
              </Button>
            }
          />
        ) : null}

        {!listQuery.isPending && !listQuery.isError && hasData ? (
          <>
            <div className="boname-page__table-content">
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
                    fillHeight
                    virtualized
                    bordered
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
            </div>

            <div className="boname-page__table-footer">
              <p>
                Exibindo <strong>{tableLabelStart}</strong> a <strong>{tableLabelEnd}</strong> de{' '}
                <strong>{records.length}</strong> registros.
              </p>
              <Pagination
                activePage={currentPage}
                boundaryLinks
                ellipsis
                first
                last
                limit={PAGE_SIZE}
                layout={['pager']}
                maxButtons={5}
                next
                prev
                total={records.length}
                onChangePage={setActivePage}
              />
            </div>
          </>
        ) : null}
      </PageSection>

      <AppModal
        open={modalMode !== null}
        backdrop="static"
        intent={modalMode === 'create' ? 'create' : modalMode === 'edit' ? 'edit' : 'view'}
        title={modalMode === 'create' ? 'Novo Boname' : modalMode === 'edit' ? 'Editar Boname' : 'Visualizar Boname'}
        subtitle={
          modalMode === 'view'
            ? 'Consulta em modo leitura do cadastro selecionado.'
            : 'Preencha os dados cadastrais e confirme a gravacao.'
        }
        intentVisible={false}
        className="boname-page__record-modal"
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
              <Button appearance="subtle" onClick={closeFormModal}>
                Cancelar
              </Button>
              <Button appearance="primary" loading={saveMutation.isPending} disabled={isFormLoading} onClick={() => void handleSubmit()}>
                Salvar
              </Button>
            </>
          )
        }
      >
        <div className="boname-page__modal-shell">
          <section className="boname-page__form-panel" aria-label="Formulario de Boname">
            <div className="boname-page__form-grid">
                <div className="boname-page__field">
                  <label htmlFor="boname-id">ID</label>
                  <InputNumber
                    id="boname-id"
                    min={0}
                    size="sm"
                    controls={false}
                    className={formErrors.bona_id ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                    value={formValues.bona_id}
                    disabled
                    onChange={(value) => {
                      setFormValues((current) => ({ ...current, bona_id: Number(value || 0) }))
                    }}
                  />
                  {formErrors.bona_id ? <span role="alert">{formErrors.bona_id}</span> : null}
                </div>

                <div className="boname-page__field">
                  <label htmlFor="boname-codigo">Codigo</label>
                  <Input
                    id="boname-codigo"
                    size="sm"
                    className={formErrors.bona_codigo ? 'boname-page__control boname-page__control--compact boname-page__control--error' : 'boname-page__control boname-page__control--compact'}
                    value={formValues.bona_codigo}
                    disabled={isReadOnly}
                    onChange={(value) => {
                      setFormValues((current) => ({ ...current, bona_codigo: toUppercaseValue(value) }))
                    }}
                  />
                  {formErrors.bona_codigo ? <span role="alert">{formErrors.bona_codigo}</span> : null}
                </div>

                <div className="boname-page__field boname-page__field--full">
                  <label htmlFor="boname-descricao">Descricao</label>
                  <Textarea
                    id="boname-descricao"
                    rows={3}
                    maxLength={BONAME_DESCR_MAX_LENGTH}
                    className={formErrors.bona_descr ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                    value={formValues.bona_descr}
                    disabled={isReadOnly}
                    onChange={(value) => {
                      const nextDescription = normalizeBonameDescription(value)
                      setFormValues((current) =>
                        current.bona_descr === nextDescription ? current : { ...current, bona_descr: nextDescription },
                      )
                    }}
                    onBlur={() => {
                      setFormValues((current) => ({
                        ...current,
                        bona_descr: normalizeBonameDescriptionForSave(current.bona_descr),
                      }))
                    }}
                  />
                  {formErrors.bona_descr ? <span role="alert">{formErrors.bona_descr}</span> : null}
                </div>

                <div className="boname-page__field">
                  <label htmlFor="boname-qt-ui">Quantidade por unidade</label>
                  <InputNumber
                    id="boname-qt-ui"
                    min={0}
                    controls={false}
                    className={formErrors.bona_qt_ui ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                    value={formValues.bona_qt_ui}
                    disabled={isReadOnly}
                    onChange={(value) => {
                      setFormValues((current) => ({ ...current, bona_qt_ui: Number(value || 0) }))
                    }}
                  />
                  {formErrors.bona_qt_ui ? <span role="alert">{formErrors.bona_qt_ui}</span> : null}
                </div>

                <div className="boname-page__field">
                  <label id="boname-diag-label">Diagnostico</label>
                  <SelectPicker
                    aria-label="Diagnostico"
                    aria-labelledby="boname-diag-label"
                    block
                    cleanable={false}
                    data={diagnosticoOptions}
                    loading={diagnosticosQuery.isPending}
                    name="bona_diag_id"
                    placeholder="Selecione o diagnostico"
                    searchable
                    className={formErrors.bona_diag_id ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                    value={formValues.bona_diag_id || null}
                    disabled={isReadOnly}
                    onChange={(value) => {
                      setFormValues((current) => ({ ...current, bona_diag_id: Number(value || 0) }))
                    }}
                  />
                  {formErrors.bona_diag_id ? <span role="alert">{formErrors.bona_diag_id}</span> : null}
                  {diagnosticosQuery.isError ? <span role="alert">Falha ao carregar os diagnosticos ativos.</span> : null}
                </div>

                <fieldset className="boname-page__field boname-page__field--full boname-page__status-fieldset">
                  <legend>Status do registro</legend>
                  <div className="boname-page__status-panel">
                    <div className="boname-page__status-copy">
                      <StatusBadge tone={formValues.bona_ativo === 1 ? 'success' : 'danger'}>
                        {formValues.bona_ativo === 1 ? 'Ativo' : 'Inativo'}
                      </StatusBadge>
                      <small>
                        {formValues.bona_ativo === 1
                          ? 'Registro disponivel para uso nas integracoes.'
                          : 'Registro mantido no cadastro, sem uso operacional ativo.'}
                      </small>
                    </div>
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
                </fieldset>
            </div>
          </section>
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
