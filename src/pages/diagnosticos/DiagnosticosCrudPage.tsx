import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, HStack, Input, InputNumber, Pagination, Panel, Textarea, useMediaQuery } from 'rsuite'
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
import '../boname/BonameCrudPage.css'

export interface DiagnosticoRecord {
  diag_id: number
  diag_descr: string
  diag_ativo: 0 | 1
}

interface ApiResponse<T> {
  data: T
  err: number
  msg: string
  status: number
}

type FormErrors = Partial<Record<keyof DiagnosticoRecord, string>>
type FormMode = 'create' | 'edit' | 'view'

export interface DiagnosticosCrudPageProps {
  apiBaseUrl?: string
  authToken?: string | null
}

const DEFAULT_FORM_VALUES: DiagnosticoRecord = {
  diag_id: 0,
  diag_descr: '',
  diag_ativo: 1,
}

const LOCAL_STORAGE_TOKEN_KEYS = ['authToken', 'access_token', 'token', 'jwtToken']
const PAGE_SIZE = 11
const DIAGNOSTICO_DESCR_MAX_LENGTH = 255

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

function normalizeDiagnosticoDescription(value: string): string {
  return value.slice(0, DIAGNOSTICO_DESCR_MAX_LENGTH)
}

function normalizeDiagnosticoDescriptionForSave(value: string): string {
  return normalizeDiagnosticoDescription(value).trim().toLocaleUpperCase('pt-BR')
}

function validateForm(values: DiagnosticoRecord): FormErrors {
  const errors: FormErrors = {}

  if (!values.diag_descr.trim()) {
    errors.diag_descr = 'Informe a descricao do diagnostico.'
  } else if (values.diag_descr.length > DIAGNOSTICO_DESCR_MAX_LENGTH) {
    errors.diag_descr = `A descricao deve ter no maximo ${DIAGNOSTICO_DESCR_MAX_LENGTH} caracteres.`
  }

  return errors
}

async function requestDiagnosticos<T>(
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

async function listarDiagnosticos(
  baseUrl: string,
  searchTerm: string,
  authToken?: string | null,
): Promise<DiagnosticoRecord[]> {
  return requestDiagnosticos<DiagnosticoRecord[]>(
    baseUrl,
    `/parametros/diagnosticos/listar/${encodeURIComponent(searchTerm)}`,
    { method: 'GET' },
    authToken,
  )
}

async function buscarDiagnostico(
  baseUrl: string,
  diagId: number,
  authToken?: string | null,
): Promise<DiagnosticoRecord> {
  return requestDiagnosticos<DiagnosticoRecord>(
    baseUrl,
    `/parametros/diagnosticos/buscar/${diagId}`,
    { method: 'GET' },
    authToken,
  )
}

async function salvarDiagnostico(
  baseUrl: string,
  values: DiagnosticoRecord,
  authToken?: string | null,
): Promise<void> {
  await requestDiagnosticos<unknown>(
    baseUrl,
    '/parametros/diagnosticos/salvar',
    {
      method: 'POST',
      body: JSON.stringify(values),
    },
    authToken,
  )
}

async function excluirDiagnostico(baseUrl: string, diagId: number, authToken?: string | null): Promise<void> {
  await requestDiagnosticos<unknown>(
    baseUrl,
    `/parametros/diagnosticos/excluir/${diagId}`,
    { method: 'DELETE' },
    authToken,
  )
}

export function DiagnosticosCrudPage({
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  authToken,
}: DiagnosticosCrudPageProps) {
  const [isCompactLayout] = useMediaQuery('(max-width: 768px)')
  const resolvedAuthToken = authToken ?? getStoredToken()
  const alert = useAppAlert()
  const queryClient = useQueryClient()
  const [searchValue, setSearchValue] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('*')
  const [activePage, setActivePage] = useState(1)
  const [modalMode, setModalMode] = useState<FormMode | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<DiagnosticoRecord | null>(null)
  const [formValues, setFormValues] = useState<DiagnosticoRecord>(DEFAULT_FORM_VALUES)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isFormLoading, setIsFormLoading] = useState(false)

  const listQuery = useQuery({
    queryKey: ['diagnosticos-list', apiBaseUrl, submittedSearch, resolvedAuthToken],
    queryFn: () => listarDiagnosticos(apiBaseUrl, submittedSearch, resolvedAuthToken),
  })

  const saveMutation = useMutation({
    mutationFn: (values: DiagnosticoRecord) => salvarDiagnostico(apiBaseUrl, values, resolvedAuthToken),
    onSuccess: async () => {
      alert.success('Diagnostico salvo', 'Registro atualizado com sucesso.')
      setModalMode(null)
      await queryClient.invalidateQueries({ queryKey: ['diagnosticos-list'] })
    },
    onError: (error: Error) => {
      alert.error('Erro ao salvar Diagnostico', getErrorMessage(error))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (diagId: number) => excluirDiagnostico(apiBaseUrl, diagId, resolvedAuthToken),
    onSuccess: async () => {
      alert.success('Diagnostico excluido', 'Registro removido com sucesso.')
      setDeleteCandidate(null)
      await queryClient.invalidateQueries({ queryKey: ['diagnosticos-list'] })
    },
    onError: (error: Error) => {
      alert.error('Erro ao excluir Diagnostico', getErrorMessage(error))
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

  const handleOpenRecordModal = async (mode: 'edit' | 'view', record: DiagnosticoRecord) => {
    setModalMode(mode)
    setFormErrors({})
    setIsFormLoading(true)

    try {
      const payload = await buscarDiagnostico(apiBaseUrl, record.diag_id, resolvedAuthToken)
      setFormValues(payload)
    } catch (error) {
      alert.error('Erro ao carregar Diagnostico', getErrorMessage(error, 'Falha ao carregar o diagnostico.'))
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
      diag_descr: normalizeDiagnosticoDescriptionForSave(formValues.diag_descr),
    })
  }

  const tableLabelStart = hasData ? pageStart + 1 : 0
  const tableLabelEnd = hasData ? pageStart + paginatedRecords.length : 0

  const renderRowActions = (rowData: DiagnosticoRecord, compact = false) => (
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
    <section className="boname-page diagnosticos-page">
      <PageSection
        className="boname-page__table-section"
        actions={
          <div className="boname-page__toolbar">
            <Input
              aria-label="Buscar diagnostico por descricao"
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
                Novo Diagnostico
              </Button>
            </HStack>
          </div>
        }
      >
        {listQuery.isPending ? (
          <DataState
            state="loading"
            title="Carregando Diagnosticos..."
            description="Consultando o endpoint `GET /parametros/diagnosticos/listar/:pesq`."
          />
        ) : null}

        {listQuery.isError ? (
          <DataState
            state="error"
            title="Nao foi possivel listar os registros"
            description={listQuery.error instanceof Error ? listQuery.error.message : 'Erro ao listar diagnosticos.'}
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
            title="Nenhum diagnostico encontrado"
            description="Cadastre um novo registro para preencher a tabela."
            action={
              <Button appearance="primary" onClick={handleOpenCreate}>
                Cadastrar diagnostico
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
                    <Panel bordered key={rowData.diag_id} className="boname-page__record-card">
                      <div className="boname-page__record-card-top">
                        <div>
                          <strong>DIAG {rowData.diag_id}</strong>
                          <p>{rowData.diag_descr}</p>
                        </div>
                        <StatusBadge tone={rowData.diag_ativo === 1 ? 'success' : 'danger'}>
                          {rowData.diag_ativo === 1 ? 'Ativo' : 'Inativo'}
                        </StatusBadge>
                      </div>

                      <dl className="boname-page__record-meta">
                        <div>
                          <dt>ID</dt>
                          <dd>{rowData.diag_id}</dd>
                        </div>
                        <div>
                          <dt>Status</dt>
                          <dd>{rowData.diag_ativo === 1 ? 'Ativo' : 'Inativo'}</dd>
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
                      <Cell dataKey="diag_id" />
                    </Column>

                    <Column flexGrow={1} minWidth={320}>
                      <HeaderCell>Descricao</HeaderCell>
                      <Cell dataKey="diag_descr" />
                    </Column>

                    <Column width={140} align="center">
                      <HeaderCell>Status</HeaderCell>
                      <Cell>
                        {(rowData: DiagnosticoRecord) => (
                          <StatusBadge tone={rowData.diag_ativo === 1 ? 'success' : 'danger'}>
                            {rowData.diag_ativo === 1 ? 'Ativo' : 'Inativo'}
                          </StatusBadge>
                        )}
                      </Cell>
                    </Column>

                    <Column width={260} fixed="right">
                      <HeaderCell>Acoes</HeaderCell>
                      <Cell>{(rowData: DiagnosticoRecord) => renderRowActions(rowData)}</Cell>
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
        title={
          modalMode === 'create' ? 'Novo Diagnostico' : modalMode === 'edit' ? 'Editar Diagnostico' : 'Visualizar Diagnostico'
        }
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
          <section className="boname-page__form-panel" aria-label="Formulario de diagnostico">
            <div className="boname-page__form-grid">
              <div className="boname-page__field">
                <label htmlFor="diagnostico-id">ID</label>
                <InputNumber
                  id="diagnostico-id"
                  min={0}
                  size="sm"
                  controls={false}
                  className={formErrors.diag_id ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                  value={formValues.diag_id}
                  disabled
                  onChange={(value) => {
                    setFormValues((current) => ({ ...current, diag_id: Number(value || 0) }))
                  }}
                />
                {formErrors.diag_id ? <span role="alert">{formErrors.diag_id}</span> : null}
              </div>

              <div className="boname-page__field boname-page__field--full">
                <label htmlFor="diagnostico-descricao">Descricao</label>
                <Textarea
                  id="diagnostico-descricao"
                  rows={3}
                  maxLength={DIAGNOSTICO_DESCR_MAX_LENGTH}
                  className={formErrors.diag_descr ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                  value={formValues.diag_descr}
                  disabled={isReadOnly}
                  onChange={(value) => {
                    const nextDescription = normalizeDiagnosticoDescription(value)
                    setFormValues((current) =>
                      current.diag_descr === nextDescription ? current : { ...current, diag_descr: nextDescription },
                    )
                  }}
                  onBlur={() => {
                    setFormValues((current) => ({
                      ...current,
                      diag_descr: normalizeDiagnosticoDescriptionForSave(current.diag_descr),
                    }))
                  }}
                />
                {formErrors.diag_descr ? <span role="alert">{formErrors.diag_descr}</span> : null}
              </div>

              <fieldset className="boname-page__field boname-page__field--full boname-page__status-fieldset">
                <legend>Status do registro</legend>
                <div className="boname-page__status-panel">
                  <div className="boname-page__status-copy">
                    <StatusBadge tone={formValues.diag_ativo === 1 ? 'success' : 'danger'}>
                      {formValues.diag_ativo === 1 ? 'Ativo' : 'Inativo'}
                    </StatusBadge>
                    <small>
                      {formValues.diag_ativo === 1
                        ? 'Registro disponivel para uso nas integracoes.'
                        : 'Registro mantido no cadastro, sem uso operacional ativo.'}
                    </small>
                  </div>
                  {!isReadOnly ? (
                    <div className="boname-page__status-actions">
                      <Button
                        appearance={formValues.diag_ativo === 1 ? 'primary' : 'subtle'}
                        size="sm"
                        onClick={() => setFormValues((current) => ({ ...current, diag_ativo: 1 }))}
                      >
                        Ativar
                      </Button>
                      <Button
                        appearance={formValues.diag_ativo === 0 ? 'primary' : 'subtle'}
                        color={formValues.diag_ativo === 0 ? 'red' : undefined}
                        size="sm"
                        onClick={() => setFormValues((current) => ({ ...current, diag_ativo: 0 }))}
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
                  void deleteMutation.mutateAsync(deleteCandidate.diag_id)
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
            Esta acao remove o cadastro <strong>{deleteCandidate?.diag_descr}</strong> e deve ser usada
            apenas quando houver certeza sobre a exclusao.
          </p>
          {deleteCandidate ? (
            <dl className="boname-page__confirm-grid">
              <div>
                <dt>ID</dt>
                <dd>{deleteCandidate.diag_id}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{deleteCandidate.diag_ativo === 1 ? 'Ativo' : 'Inativo'}</dd>
              </div>
            </dl>
          ) : null}
        </div>
      </AppModal>
    </section>
  )
}

export default DiagnosticosCrudPage
