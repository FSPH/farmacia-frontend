import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Button,
  ButtonToolbar,
  Divider,
  Input,
  InputNumber,
  Loader,
  Modal,
  Panel,
  Placeholder,
  Stack,
  Table,
  Tag,
  Toggle,
  useMediaQuery,
} from 'rsuite'
import type { RowDataType } from 'rsuite-table'
import { getErrorMessage, useAppAlert } from '../hooks/useAppAlert'
import { apiRequest } from '../lib/api'
import './BonamePage.css'

const { Column, HeaderCell, Cell } = Table

type BonameRecord = {
  bona_id: number
  bona_codigo: string
  bona_descr: string
  bona_qt_ui: number
  bona_diag_id: number
  bona_ativo: 0 | 1
}

const INITIAL_FORM_VALUES: BonameRecord = {
  bona_id: 0,
  bona_codigo: '',
  bona_descr: '',
  bona_qt_ui: 0,
  bona_diag_id: 0,
  bona_ativo: 1,
}

function getSearchParam(search: string) {
  const trimmed = search.trim()
  return encodeURIComponent(trimmed || '*')
}

function toInteger(value: number | string | null | undefined) {
  return Number(value || 0)
}

function validateForm(values: BonameRecord) {
  if (values.bona_id <= 0) {
    return 'Informe um ID maior que zero.'
  }

  if (!values.bona_codigo.trim()) {
    return 'Informe o codigo do Boname.'
  }

  if (!values.bona_descr.trim()) {
    return 'Informe a descricao do Boname.'
  }

  if (values.bona_qt_ui <= 0) {
    return 'Informe uma quantidade por unidade maior que zero.'
  }

  if (values.bona_diag_id <= 0) {
    return 'Informe um ID de diagnostico maior que zero.'
  }

  return null
}

async function fetchBonameList(search: string) {
  return apiRequest<BonameRecord[]>(`/parametros/boname/listar/${getSearchParam(search)}`)
}

async function fetchBonameById(bonaId: number) {
  return apiRequest<BonameRecord>(`/parametros/boname/buscar/${bonaId}`)
}

async function saveBoname(payload: BonameRecord) {
  return apiRequest<null>('/parametros/boname/salvar', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

async function deleteBoname(bonaId: number) {
  return apiRequest<null>(`/parametros/boname/excluir/${bonaId}`, {
    method: 'DELETE',
  })
}

function ActiveCell({ rowData }: { rowData?: RowDataType<BonameRecord> | BonameRecord }) {
  const isActive = Number(rowData?.bona_ativo || 0) === 1
  return <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Ativo' : 'Inativo'}</Tag>
}

type ActionCellProps = {
  rowData?: RowDataType<BonameRecord> | BonameRecord
  onEdit: (bonaId: number) => void
  onDelete: (record: BonameRecord) => void | Promise<void>
}

function ActionCell({ rowData, onEdit, onDelete }: ActionCellProps) {
  const bonaId = Number(rowData?.bona_id || 0)

  return (
    <Stack spacing={8} justifyContent="flex-end">
      <Button appearance="link" size="sm" onClick={() => onEdit(bonaId)}>
        Editar
      </Button>
      <Button appearance="link" color="red" size="sm" onClick={() => onDelete(rowData as BonameRecord)}>
        Excluir
      </Button>
    </Stack>
  )
}

export default function BonamePage() {
  const alert = useAppAlert()
  const queryClient = useQueryClient()
  const [isMobile] = useMediaQuery('(max-width: 768px)')
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [formValues, setFormValues] = useState<BonameRecord>(INITIAL_FORM_VALUES)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)

  const bonameListQuery = useQuery({
    queryKey: ['boname', 'list', searchTerm],
    queryFn: () => fetchBonameList(searchTerm),
  })

  const loadBonameMutation = useMutation({
    mutationFn: fetchBonameById,
    onSuccess: (data) => {
      setFormValues(data)
      setIsFormModalOpen(true)
      void alert.info('Boname carregado', `${data.bona_codigo} pronto para edicao.`)
    },
    onError: (error) => {
      setIsFormModalOpen(false)
      void alert.error('Erro ao carregar Boname', getErrorMessage(error))
    },
  })

  const saveMutation = useMutation({
    mutationFn: saveBoname,
    onSuccess: async () => {
      setIsFormModalOpen(false)
      void alert.success('Boname salvo', 'Registro atualizado com sucesso.')

      await queryClient.invalidateQueries({ queryKey: ['boname', 'list'] })
      await queryClient.invalidateQueries({ queryKey: ['boname', 'detail', formValues.bona_id] })
    },
    onError: (error) => {
      void alert.error('Erro ao salvar Boname', getErrorMessage(error))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBoname,
    onSuccess: async (_, bonaId) => {
      void alert.success('Boname excluido', `Registro ${bonaId} removido.`)

      await queryClient.invalidateQueries({ queryKey: ['boname', 'list'] })

      if (formValues.bona_id === bonaId) {
        setFormValues(INITIAL_FORM_VALUES)
        setIsFormModalOpen(false)
      }
    },
    onError: (error) => {
      void alert.error('Erro ao excluir Boname', getErrorMessage(error))
    },
  })

  const records = bonameListQuery.data || []
  const handleSearch = () => {
    setSearchTerm(searchInput)
  }

  const handleResetForm = () => {
    setFormValues(INITIAL_FORM_VALUES)
    setIsFormModalOpen(true)
    void alert.info('Novo cadastro', 'Formulario limpo para um novo Boname.')
  }

  const handleEdit = (bonaId: number) => {
    if (!bonaId) {
      return
    }

    setIsFormModalOpen(true)
    loadBonameMutation.mutate(bonaId)
  }

  const handleSave = async () => {
    const validationMessage = validateForm(formValues)

    if (validationMessage) {
      await alert.message({
        icon: 'warning',
        title: 'Campos obrigatorios',
        text: validationMessage,
        confirmButtonText: 'Revisar formulario',
      })
      return
    }

    saveMutation.mutate({
      ...formValues,
      bona_codigo: formValues.bona_codigo.trim(),
      bona_descr: formValues.bona_descr.trim(),
      bona_id: toInteger(formValues.bona_id),
      bona_qt_ui: toInteger(formValues.bona_qt_ui),
      bona_diag_id: toInteger(formValues.bona_diag_id),
      bona_ativo: formValues.bona_ativo ? 1 : 0,
    })
  }

  const handleAskDelete = async (record: BonameRecord) => {
    if (!record.bona_id) {
      return
    }

    const confirmed = await alert.confirm({
      confirmButtonText: 'Excluir registro',
      cancelButtonText: 'Cancelar',
      text: `Esta acao remove o registro ${record.bona_codigo || record.bona_id}.`,
      title: 'Excluir Boname?',
    })

    if (!confirmed) {
      return
    }

    deleteMutation.mutate(record.bona_id)
  }

  return (
    <section className="boname-page">
      <Panel bordered header="Consulta de Boname" className="boname-page__panel">
        <div className="boname-page__toolbar">
          <div className="boname-page__form-field">
            <label className="boname-page__form-label" htmlFor="boname-search">
              Pesquisar por descricao
            </label>
            <Input
              id="boname-search"
              value={searchInput}
              placeholder="Digite uma descricao ou deixe vazio para listar tudo"
              onChange={(value) => setSearchInput(value)}
              onPressEnter={handleSearch}
            />
          </div>

          <Button appearance="primary" onClick={handleSearch} loading={bonameListQuery.isFetching}>
            Buscar
          </Button>

          <Button appearance="primary" color="green" onClick={handleResetForm}>
            Novo
          </Button>

          <Button appearance="subtle" onClick={() => setSearchInput('')}>
            Limpar busca
          </Button>
        </div>

        <Divider />

        {bonameListQuery.isLoading ? (
          <div className="boname-page__table-status">
            <Loader center content="Carregando Boname..." />
            <Placeholder.Paragraph rows={6} active />
          </div>
        ) : bonameListQuery.isError ? (
          <div className="boname-page__empty">
            <strong>Erro ao carregar Boname.</strong>
            <span className="boname-page__empty-copy">{bonameListQuery.error.message}</span>
          </div>
        ) : records.length === 0 ? (
          <div className="boname-page__empty">
            <strong>Nenhum registro encontrado.</strong>
            <span className="boname-page__empty-copy">
              Ajuste a busca ou abra o modal de cadastro para incluir um novo Boname.
            </span>
          </div>
        ) : (
          <div className="boname-page__table-scroll">
            <Table
              data={records}
              bordered
              cellBordered
              height={isMobile ? 430 : 520}
              rowKey="bona_id"
              hover={false}
              fillHeight={false}
            >
            <Column width={90} align="center" fixed>
              <HeaderCell>ID</HeaderCell>
              <Cell dataKey="bona_id" />
            </Column>

            <Column width={150}>
              <HeaderCell>Codigo</HeaderCell>
              <Cell dataKey="bona_codigo" />
            </Column>

            <Column flexGrow={1} minWidth={260}>
              <HeaderCell>Descricao</HeaderCell>
              <Cell dataKey="bona_descr" />
            </Column>

            <Column width={110} align="center">
              <HeaderCell>Qt UI</HeaderCell>
              <Cell dataKey="bona_qt_ui" />
            </Column>

            <Column width={120} align="center">
              <HeaderCell>Diag. ID</HeaderCell>
              <Cell dataKey="bona_diag_id" />
            </Column>

            <Column width={120} align="center">
              <HeaderCell>Status</HeaderCell>
              <Cell>
                {(rowData) => <ActiveCell rowData={rowData} />}
              </Cell>
            </Column>

            <Column width={140} fixed="right">
              <HeaderCell>Acoes</HeaderCell>
              <Cell>
                {(rowData) => (
                  <ActionCell
                    rowData={rowData}
                    onEdit={handleEdit}
                    onDelete={handleAskDelete}
                  />
                )}
              </Cell>
            </Column>
          </Table>
          </div>
        )}

        <Divider />

        <div className="boname-page__table-status">
          <strong>Observacoes da API</strong>
          <span className="boname-page__helper">
            Para novo cadastro, o backend exige um `bona_id` diferente de zero. A busca usa o campo de descricao.
          </span>
        </div>
      </Panel>

      <Modal open={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} size="md">
        <Modal.Header>
          <Modal.Title>{formValues.bona_id ? 'Cadastro e edicao de Boname' : 'Novo Boname'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadBonameMutation.isPending ? (
            <div className="boname-page__table-status">
              <Loader center content="Carregando registro..." />
              <Placeholder.Paragraph rows={5} active />
            </div>
          ) : (
            <>
              <div className="boname-page__form-grid">
                <div className="boname-page__form-field">
                  <label className="boname-page__form-label" htmlFor="boname-id">
                    ID
                  </label>
                  <InputNumber
                    id="boname-id"
                    value={formValues.bona_id}
                    min={0}
                    onChange={(value) => setFormValues((current) => ({ ...current, bona_id: toInteger(value) }))}
                  />
                </div>

                <div className="boname-page__form-field">
                  <label className="boname-page__form-label" htmlFor="boname-codigo">
                    Codigo
                  </label>
                  <Input
                    id="boname-codigo"
                    value={formValues.bona_codigo}
                    onChange={(value) => setFormValues((current) => ({ ...current, bona_codigo: value }))}
                  />
                </div>

                <div className="boname-page__form-field boname-page__form-field--full">
                  <label className="boname-page__form-label" htmlFor="boname-descricao">
                    Descricao
                  </label>
                  <Input
                    id="boname-descricao"
                    value={formValues.bona_descr}
                    onChange={(value) => setFormValues((current) => ({ ...current, bona_descr: value }))}
                  />
                </div>

                <div className="boname-page__form-field">
                  <label className="boname-page__form-label" htmlFor="boname-qt-ui">
                    Quantidade por unidade
                  </label>
                  <InputNumber
                    id="boname-qt-ui"
                    value={formValues.bona_qt_ui}
                    min={0}
                    onChange={(value) => setFormValues((current) => ({ ...current, bona_qt_ui: toInteger(value) }))}
                  />
                </div>

                <div className="boname-page__form-field">
                  <label className="boname-page__form-label" htmlFor="boname-diag-id">
                    Diagnostico ID
                  </label>
                  <InputNumber
                    id="boname-diag-id"
                    value={formValues.bona_diag_id}
                    min={0}
                    onChange={(value) => setFormValues((current) => ({ ...current, bona_diag_id: toInteger(value) }))}
                  />
                </div>

                <div className="boname-page__form-field boname-page__form-field--full">
                  <label className="boname-page__form-label" htmlFor="boname-ativo">
                    Status
                  </label>
                  <Stack spacing={12} alignItems="center">
                    <Toggle
                      id="boname-ativo"
                      checked={formValues.bona_ativo === 1}
                      checkedChildren="Ativo"
                      unCheckedChildren="Inativo"
                      onChange={(checked) =>
                        setFormValues((current) => ({
                          ...current,
                          bona_ativo: checked ? 1 : 0,
                        }))
                      }
                    />
                    <Tag className="boname-page__tag" color={formValues.bona_ativo === 1 ? 'green' : 'red'}>
                      {formValues.bona_ativo === 1 ? 'Registro ativo' : 'Registro inativo'}
                    </Tag>
                  </Stack>
                </div>
              </div>

              <Divider />

              <ButtonToolbar>
                <Button appearance="primary" onClick={() => void handleSave()} loading={saveMutation.isPending}>
                  Salvar
                </Button>
                <Button
                  appearance="ghost"
                  color="red"
                  disabled={!formValues.bona_id}
                  onClick={() => handleAskDelete(formValues)}
                >
                  Excluir atual
                </Button>
                <Button appearance="subtle" onClick={() => setIsFormModalOpen(false)}>
                  Fechar
                </Button>
              </ButtonToolbar>
            </>
          )}
        </Modal.Body>
      </Modal>
    </section>
  )
}
