import { useState, useTransition } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Button,
  Divider,
  HStack,
  Input,
  InputGroup,
  InputNumber,
  Loader,
  Message,
  Modal,
  Panel,
  Placeholder,
  Tag,
  Toggle,
  VStack,
} from 'rsuite'
import { Cell, Column, HeaderCell, Table } from 'rsuite-table'
import SearchIcon from '@rsuite/icons/Search'
import ReloadIcon from '@rsuite/icons/Reload'
import PlusIcon from '@rsuite/icons/Plus'
import EditIcon from '@rsuite/icons/Edit'
import TrashIcon from '@rsuite/icons/Trash'
import { getErrorMessage, useAppAlert } from '../../hooks/useAppAlert'
import 'rsuite-table/dist/css/rsuite-table.css'
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
  err: number
  msg: string
  status: number
  data: T
}

type FormErrors = Partial<Record<keyof BonameRecord, string>>
type FormMode = 'create' | 'edit'

export interface BonameCrudPageProps {
  apiBaseUrl?: string
  authToken?: string | null
  title?: string
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
    // Non-JSON responses are handled by the status checks below.
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
  title = 'Cadastro de Boname',
}: BonameCrudPageProps) {
  const resolvedAuthToken = authToken ?? getStoredToken()
  const alert = useAppAlert()
  const queryClient = useQueryClient()
  const [searchValue, setSearchValue] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('*')
  const [isSearchPending, startSearchTransition] = useTransition()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<FormMode>('create')
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
      void alert.success('Boname salvo', 'Registro atualizado com sucesso.')

      setIsFormOpen(false)
      await queryClient.invalidateQueries({ queryKey: ['boname-list'] })
    },
    onError: (error: Error) => {
      void alert.error('Erro ao salvar Boname', getErrorMessage(error))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (bonaId: number) => excluirBoname(apiBaseUrl, bonaId, resolvedAuthToken),
    onSuccess: async () => {
      void alert.success('Boname excluido', 'Registro removido com sucesso.')
      await queryClient.invalidateQueries({ queryKey: ['boname-list'] })
    },
    onError: (error: Error) => {
      void alert.error('Erro ao excluir Boname', getErrorMessage(error))
    },
  })

  const handleSearch = () => {
    startSearchTransition(() => {
      setSubmittedSearch(normalizeSearchTerm(searchValue))
    })
  }

  const handleResetSearch = () => {
    setSearchValue('')

    startSearchTransition(() => {
      setSubmittedSearch('*')
    })
  }

  const handleOpenCreate = () => {
    setFormMode('create')
    setFormValues(DEFAULT_FORM_VALUES)
    setFormErrors({})
    setIsFormLoading(false)
    setIsFormOpen(true)
  }

  const handleOpenEdit = async (record: BonameRecord) => {
    setFormMode('edit')
    setFormErrors({})
    setIsFormLoading(true)
    setIsFormOpen(true)

    try {
      const payload = await buscarBoname(apiBaseUrl, record.bona_id, resolvedAuthToken)
      setFormValues(payload)
    } catch (error) {
      void alert.error('Erro ao carregar Boname', getErrorMessage(error, 'Falha ao carregar o Boname.'))

      setIsFormOpen(false)
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
        confirmButtonText: 'Revisar formulario',
      })
      return
    }

    await saveMutation.mutateAsync({
      ...formValues,
      bona_codigo: formValues.bona_codigo.trim(),
      bona_descr: formValues.bona_descr.trim(),
    })
  }

  const handleAskDelete = async (record: BonameRecord) => {
    const confirmed = await alert.confirm({
      confirmButtonText: 'Excluir registro',
      cancelButtonText: 'Cancelar',
      text: `Esta acao remove o Boname ${record.bona_descr}.`,
      title: 'Confirmar exclusao',
    })

    if (!confirmed) {
      return
    }

    deleteMutation.mutate(record.bona_id)
  }

  const records = listQuery.data ?? []
  const activeCount = records.filter((record) => record.bona_ativo === 1).length
  const inactiveCount = records.length - activeCount
  const tableHeight = Math.min(Math.max(records.length * 46 + 120, 260), 560)
  const hasAuthToken = Boolean(resolvedAuthToken)
  const hasData = records.length > 0

  return (
    <section className="boname-page">
      <Panel bordered className="boname-page__hero">
        <div className="boname-page__hero-grid">
          <VStack spacing={10} alignItems="flex-start" className="boname-page__hero-copy">
            <span className="boname-page__eyebrow">Parametros hospitalares</span>
            <h1>{title}</h1>
            <p>
              CRUD de Boname com busca por descricao, consulta por ID, formulario completo de
              manutencao e exclusao confirmada.
            </p>
          </VStack>

          <div className="boname-page__stats">
            <article className="boname-page__stat-card">
              <span>Listados</span>
              <strong>{records.length}</strong>
              <small>Resultado atual da busca</small>
            </article>
            <article className="boname-page__stat-card">
              <span>Ativos</span>
              <strong>{activeCount}</strong>
              <small>{inactiveCount} inativos no recorte atual</small>
            </article>
            <article className="boname-page__stat-card">
              <span>Integracao</span>
              <strong>{hasAuthToken ? 'Token pronto' : 'Token ausente'}</strong>
              <small>{apiBaseUrl}</small>
            </article>
          </div>
        </div>
      </Panel>

      {!hasAuthToken ? (
        <Message showIcon type="warning" className="boname-page__message">
          Nenhum token foi encontrado em props ou localStorage. Se o backend exigir JWT, forneca
          `authToken` para a pagina.
        </Message>
      ) : null}

      <Panel bordered className="boname-page__toolbar-panel">
        <div className="boname-page__toolbar">
          <div className="boname-page__search">
            <span className="boname-page__field-label">Busca por descricao</span>
            <InputGroup inside size="lg">
              <InputGroup.Addon>
                <SearchIcon />
              </InputGroup.Addon>
              <Input
                aria-label="Buscar Boname"
                placeholder="Digite a descricao do Boname"
                value={searchValue}
                onChange={setSearchValue}
                onPressEnter={handleSearch}
              />
            </InputGroup>
          </div>

          <HStack spacing={12} wrap className="boname-page__toolbar-actions">
            <Button
              appearance="primary"
              startIcon={<SearchIcon />}
              loading={isSearchPending}
              onClick={handleSearch}
            >
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
        </div>

        <Divider />

        <HStack spacing={12} wrap>
          <Tag color="blue">Filtro aplicado: {submittedSearch === '*' ? 'todos os registros' : submittedSearch}</Tag>
          <Tag color="cyan">Salvar exige `bona_id` manual</Tag>
          <Tag color="green">Excluir exige confirmacao</Tag>
        </HStack>
      </Panel>

      <Panel bordered className="boname-page__table-panel">
        <div className="boname-page__section-heading">
          <div>
            <h2>Listagem</h2>
            <p>Consulta ligada a `GET /parametros/boname/listar/:pesq`.</p>
          </div>
        </div>

        {listQuery.isPending ? (
          <div className="boname-page__loading-state">
            <Loader size="md" content="Carregando Bonames..." vertical />
            <Placeholder.Paragraph rows={6} active />
          </div>
        ) : null}

        {listQuery.isError ? (
          <Message showIcon type="error" className="boname-page__message">
            {listQuery.error instanceof Error ? listQuery.error.message : 'Erro ao listar Bonames.'}
          </Message>
        ) : null}

        {!listQuery.isPending && !listQuery.isError && !hasData ? (
          <div className="boname-page__empty-state">
            <strong>Nenhum Boname encontrado.</strong>
            <p>Ajuste a busca ou cadastre um novo registro para preencher a tabela.</p>
            <Button appearance="primary" onClick={handleOpenCreate}>
              Cadastrar Boname
            </Button>
          </div>
        ) : null}

        {!listQuery.isPending && !listQuery.isError && hasData ? (
          <div className="boname-page__table-wrap">
            <Table
              data={records}
              height={tableHeight}
              bordered
              cellBordered
              hover={false}
              rowHeight={46}
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

              <Column width={120} align="center">
                <HeaderCell>Status</HeaderCell>
                <Cell>
                  {(rowData: BonameRecord) => (
                    <Tag color={rowData.bona_ativo === 1 ? 'green' : 'red'}>
                      {rowData.bona_ativo === 1 ? 'Ativo' : 'Inativo'}
                    </Tag>
                  )}
                </Cell>
              </Column>

              <Column width={180} fixed="right">
                <HeaderCell>Acoes</HeaderCell>
                <Cell>
                  {(rowData: BonameRecord) => (
                    <HStack spacing={8} className="boname-page__row-actions">
                      <Button
                        appearance="subtle"
                        size="xs"
                        startIcon={<EditIcon />}
                        onClick={() => {
                          void handleOpenEdit(rowData)
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        appearance="subtle"
                        color="red"
                        size="xs"
                        startIcon={<TrashIcon />}
                        onClick={() => {
                          void handleAskDelete(rowData)
                        }}
                      >
                        Excluir
                      </Button>
                    </HStack>
                  )}
                </Cell>
              </Column>
            </Table>
          </div>
        ) : null}
      </Panel>

      <Modal open={isFormOpen} size="md" onClose={() => setIsFormOpen(false)}>
        <Modal.Header>
          <Modal.Title>{formMode === 'create' ? 'Novo Boname' : 'Editar Boname'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isFormLoading ? (
            <div className="boname-page__modal-loading">
              <Loader size="md" content="Buscando dados do Boname..." vertical />
            </div>
          ) : (
            <div className="boname-page__form-grid">
              <div className="boname-page__form-field">
                <label htmlFor="boname-id">ID</label>
                <InputNumber
                  id="boname-id"
                  min={0}
                  value={formValues.bona_id}
                  disabled={formMode === 'edit'}
                  onChange={(value) => {
                    setFormValues((current) => ({ ...current, bona_id: Number(value || 0) }))
                  }}
                />
                <small>O backend exige `bona_id` informado no salvar.</small>
                {formErrors.bona_id ? <span>{formErrors.bona_id}</span> : null}
              </div>

              <div className="boname-page__form-field">
                <label htmlFor="boname-codigo">Codigo</label>
                <Input
                  id="boname-codigo"
                  value={formValues.bona_codigo}
                  onChange={(value) => {
                    setFormValues((current) => ({ ...current, bona_codigo: toUppercaseValue(value) }))
                  }}
                />
                {formErrors.bona_codigo ? <span>{formErrors.bona_codigo}</span> : null}
              </div>

              <div className="boname-page__form-field boname-page__form-field--full">
                <label htmlFor="boname-descricao">Descricao</label>
                <Input
                  id="boname-descricao"
                  as="textarea"
                  rows={3}
                  value={formValues.bona_descr}
                  onChange={(value) => {
                    setFormValues((current) => ({ ...current, bona_descr: toUppercaseValue(value) }))
                  }}
                />
                {formErrors.bona_descr ? <span>{formErrors.bona_descr}</span> : null}
              </div>

              <div className="boname-page__form-field">
                <label htmlFor="boname-qt-ui">Quantidade por unidade</label>
                <InputNumber
                  id="boname-qt-ui"
                  min={0}
                  value={formValues.bona_qt_ui}
                  onChange={(value) => {
                    setFormValues((current) => ({ ...current, bona_qt_ui: Number(value || 0) }))
                  }}
                />
                {formErrors.bona_qt_ui ? <span>{formErrors.bona_qt_ui}</span> : null}
              </div>

              <div className="boname-page__form-field">
                <label htmlFor="boname-diag-id">Diagnostico ID</label>
                <InputNumber
                  id="boname-diag-id"
                  min={0}
                  value={formValues.bona_diag_id}
                  onChange={(value) => {
                    setFormValues((current) => ({ ...current, bona_diag_id: Number(value || 0) }))
                  }}
                />
                {formErrors.bona_diag_id ? <span>{formErrors.bona_diag_id}</span> : null}
              </div>

              <div className="boname-page__form-field boname-page__form-field--full">
                <label htmlFor="boname-ativo">Registro ativo</label>
                <div className="boname-page__toggle-row">
                  <Toggle
                    id="boname-ativo"
                    checked={formValues.bona_ativo === 1}
                    checkedChildren="Ativo"
                    unCheckedChildren="Inativo"
                    onChange={(checked) => {
                      setFormValues((current) => ({ ...current, bona_ativo: checked ? 1 : 0 }))
                    }}
                  />
                  <Tag color={formValues.bona_ativo === 1 ? 'green' : 'red'}>
                    {formValues.bona_ativo === 1 ? 'Disponivel para uso' : 'Bloqueado para uso'}
                  </Tag>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button appearance="primary" loading={saveMutation.isPending} disabled={isFormLoading} onClick={() => void handleSubmit()}>
            Salvar
          </Button>
          <Button appearance="subtle" onClick={() => setIsFormOpen(false)}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  )
}

export default BonameCrudPage
