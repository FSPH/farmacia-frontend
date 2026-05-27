import { useEffect, useMemo, useState } from 'react'
import { StateBlock } from '../components/StateBlock'
import {
  deleteSupportRow,
  listSupportRows,
  saveSupportRow,
  type BonameRow,
  type DiagnosticoRow,
  type SupportEntityKey,
  type TipoMedicamentoRow,
} from '../services/pharmacyApi'

type LookupOption = {
  value: string | number
  label: string
}

type FormFieldType = 'text' | 'number' | 'checkbox' | 'select'

type FormField = {
  name: string
  label: string
  type: FormFieldType
  required?: boolean
  placeholder?: string
  optionsKey?: 'diagnosticos' | 'tiposMedicamentos' | 'boname'
  readOnly?: boolean
}

type SupportEntityConfig = {
  key: SupportEntityKey
  slug: string
  label: string
  description: string
  listKicker: string
  idField: string
  canSave: boolean
  canCreate: boolean
  canDelete: boolean
  searchEnabled: boolean
  columns: Array<{
    key: string
    label: string
  }>
  fields: FormField[]
  createDefault: (rows: Record<string, unknown>[]) => Record<string, unknown>
  toPayload: (form: Record<string, unknown>) => Record<string, unknown>
}

type SupportPageProps = {
  pathname: string
  onNavigate: (route: string) => void
}

type LookupState = {
  diagnosticos: DiagnosticoRow[]
  tiposMedicamentos: TipoMedicamentoRow[]
  boname: BonameRow[]
}

const entityConfigs: SupportEntityConfig[] = [
  {
    key: 'tipos-medicamentos',
    slug: 'tipos-medicamentos',
    label: 'Tipos de medicamentos',
    description: 'Tabela de apoio para classificar medicamentos e abastecer filtros operacionais.',
    listKicker: 'Parametros',
    idField: 'tipo_id',
    canSave: true,
    canCreate: true,
    canDelete: true,
    searchEnabled: true,
    columns: [
      { key: 'tipo_id', label: 'ID' },
      { key: 'tipo_codigo', label: 'Codigo' },
      { key: 'tipo_descr', label: 'Descricao' },
      { key: 'tipo_ativo', label: 'Ativo' },
    ],
    fields: [
      { name: 'tipo_id', label: 'ID', type: 'number', required: true },
      { name: 'tipo_codigo', label: 'Codigo', type: 'text', required: true },
      { name: 'tipo_descr', label: 'Descricao', type: 'text', required: true },
      { name: 'tipo_ativo', label: 'Ativo', type: 'checkbox' },
    ],
    createDefault: (rows: Record<string, unknown>[]) => ({
      tipo_id: nextNumericId(rows, 'tipo_id'),
      tipo_codigo: '',
      tipo_descr: '',
      tipo_ativo: 1,
    }),
    toPayload: identityPayload,
  },
  {
    key: 'diagnosticos',
    slug: 'diagnosticos',
    label: 'Diagnosticos',
    description: 'Tabela de apoio para patologias vinculadas a medicamentos e BONAME.',
    listKicker: 'Parametros',
    idField: 'diag_id',
    canSave: true,
    canCreate: true,
    canDelete: true,
    searchEnabled: true,
    columns: [
      { key: 'diag_id', label: 'ID' },
      { key: 'diag_descr', label: 'Descricao' },
      { key: 'diag_ativo', label: 'Ativo' },
    ],
    fields: [
      { name: 'diag_id', label: 'ID', type: 'number', required: true },
      { name: 'diag_descr', label: 'Descricao', type: 'text', required: true },
      { name: 'diag_ativo', label: 'Ativo', type: 'checkbox' },
    ],
    createDefault: (rows: Record<string, unknown>[]) => ({
      diag_id: nextNumericId(rows, 'diag_id'),
      diag_descr: '',
      diag_ativo: 1,
    }),
    toPayload: identityPayload,
  },
  {
    key: 'boname',
    slug: 'boname',
    label: 'BONAME',
    description: 'Relaciona codigo, descricao e diagnostico de referencia para dispensacao.',
    listKicker: 'Parametros',
    idField: 'bona_id',
    canSave: true,
    canCreate: true,
    canDelete: true,
    searchEnabled: true,
    columns: [
      { key: 'bona_id', label: 'ID' },
      { key: 'bona_codigo', label: 'Codigo' },
      { key: 'bona_descr', label: 'Descricao' },
      { key: 'bona_qt_ui', label: 'Qt UI' },
      { key: 'bona_ativo', label: 'Ativo' },
    ],
    fields: [
      { name: 'bona_id', label: 'ID', type: 'number', required: true },
      { name: 'bona_codigo', label: 'Codigo', type: 'text', required: true },
      { name: 'bona_descr', label: 'Descricao', type: 'text', required: true },
      { name: 'bona_qt_ui', label: 'Quantidade por unidade', type: 'number', required: true },
      { name: 'bona_diag_id', label: 'Diagnostico', type: 'select', required: true, optionsKey: 'diagnosticos' },
      { name: 'bona_ativo', label: 'Ativo', type: 'checkbox' },
    ],
    createDefault: (rows: Record<string, unknown>[]) => ({
      bona_id: nextNumericId(rows, 'bona_id'),
      bona_codigo: '',
      bona_descr: '',
      bona_qt_ui: 0,
      bona_diag_id: '',
      bona_ativo: 1,
    }),
    toPayload: identityPayload,
  },
  {
    key: 'medicamentos',
    slug: 'medicamentos',
    label: 'Medicamentos',
    description: 'Cadastro central com unidade, tipo, vinculos de BONAME e niveis de estoque.',
    listKicker: 'Cadastro central',
    idField: 'med_id',
    canSave: true,
    canCreate: true,
    canDelete: true,
    searchEnabled: true,
    columns: [
      { key: 'med_id', label: 'ID' },
      { key: 'med_descr', label: 'Descricao' },
      { key: 'med_und', label: 'Und' },
      { key: 'med_tipo_codigo', label: 'Tipo' },
      { key: 'med_ativo', label: 'Ativo' },
    ],
    fields: [
      { name: 'med_id', label: 'ID', type: 'number', required: true },
      { name: 'med_descr', label: 'Descricao generica', type: 'text', required: true },
      { name: 'med_descr_coml', label: 'Descricao comercial', type: 'text', required: true },
      { name: 'med_und', label: 'Unidade', type: 'text', required: true },
      { name: 'med_tipo_codigo', label: 'Tipo de medicamento', type: 'select', required: true, optionsKey: 'tiposMedicamentos' },
      { name: 'med_tipo_med', label: 'Classe interna', type: 'text', required: true },
      { name: 'med_max', label: 'Estoque maximo', type: 'number', required: true },
      { name: 'med_min', label: 'Estoque minimo', type: 'number', required: true },
      { name: 'med_ui_cx', label: 'UI por caixa', type: 'number', required: true },
      { name: 'med_bona_codigo', label: 'BONAME', type: 'select', required: true, optionsKey: 'boname' },
      { name: 'med_alert', label: 'Nivel de alerta', type: 'number', required: true },
      { name: 'med_diag_id', label: 'Diagnostico', type: 'select', required: true, optionsKey: 'diagnosticos' },
      { name: 'med_ativo', label: 'Ativo', type: 'checkbox' },
    ],
    createDefault: (rows: Record<string, unknown>[]) => ({
      med_id: nextNumericId(rows, 'med_id'),
      med_descr: '',
      med_descr_coml: '',
      med_und: '',
      med_tipo_codigo: '',
      med_tipo_med: '',
      med_max: 0,
      med_min: 0,
      med_ui_cx: 0,
      med_bona_codigo: '',
      med_alert: 0,
      med_diag_id: '',
      med_ativo: 1,
    }),
    toPayload: identityPayload,
  },
  {
    key: 'depositos',
    slug: 'depositos',
    label: 'Depositos',
    description: 'Controla os locais fisicos de armazenamento usados no estoque e inventario.',
    listKicker: 'Parametros',
    idField: 'dep_id',
    canSave: true,
    canCreate: true,
    canDelete: true,
    searchEnabled: true,
    columns: [
      { key: 'dep_id', label: 'ID' },
      { key: 'dep_descr', label: 'Descricao' },
      { key: 'dep_ativo', label: 'Ativo' },
    ],
    fields: [
      { name: 'dep_id', label: 'ID', type: 'number', required: true },
      { name: 'dep_descr', label: 'Descricao', type: 'text', required: true },
      { name: 'dep_ativo', label: 'Ativo', type: 'checkbox' },
    ],
    createDefault: (rows: Record<string, unknown>[]) => ({
      dep_id: nextNumericId(rows, 'dep_id'),
      dep_descr: '',
      dep_ativo: 1,
    }),
    toPayload: (form) => ({
      depo_id: normalizeNumber(form.dep_id),
      depo_descr: String(form.dep_descr || ''),
      depo_ativo: normalizeBoolean(form.dep_ativo),
    }),
  },
  {
    key: 'locais',
    slug: 'locais',
    label: 'Locais',
    description: 'Setores solicitantes usados nas requisicoes internas e assistenciais.',
    listKicker: 'Parametros',
    idField: 'local_id',
    canSave: true,
    canCreate: false,
    canDelete: true,
    searchEnabled: true,
    columns: [
      { key: 'local_id', label: 'ID' },
      { key: 'local_descr', label: 'Descricao' },
      { key: 'local_ativo', label: 'Ativo' },
    ],
    fields: [
      { name: 'local_id', label: 'ID', type: 'number', required: true },
      { name: 'local_descr', label: 'Descricao', type: 'text', required: true },
      { name: 'local_ativo', label: 'Ativo', type: 'checkbox' },
    ],
    createDefault: (rows: Record<string, unknown>[]) => ({
      local_id: nextNumericId(rows, 'local_id'),
      local_descr: '',
      local_ativo: 1,
    }),
    toPayload: identityPayload,
  },
  {
    key: 'tipos-requisicoes',
    slug: 'tipos-requisicoes',
    label: 'Tipos de requisicoes',
    description: 'Consulta dos tipos cadastrados para as requisicoes do fluxo assistencial.',
    listKicker: 'Referencia',
    idField: 'tip_id',
    canSave: false,
    canCreate: false,
    canDelete: false,
    searchEnabled: false,
    columns: [
      { key: 'tip_id', label: 'ID' },
      { key: 'tip_codigo', label: 'Codigo' },
      { key: 'tip_descr', label: 'Descricao' },
    ],
    fields: [
      { name: 'tip_id', label: 'ID', type: 'number', readOnly: true },
      { name: 'tip_codigo', label: 'Codigo', type: 'text', readOnly: true },
      { name: 'tip_descr', label: 'Descricao', type: 'text', readOnly: true },
    ],
    createDefault: () => ({
      tip_id: 0,
      tip_codigo: '',
      tip_descr: '',
    }),
    toPayload: identityPayload,
  },
]

function identityPayload(form: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(form).map(([key, value]) => {
      if (typeof value === 'boolean') {
        return [key, value ? 1 : 0]
      }

      return [key, value]
    }),
  )
}

function normalizeNumber(value: unknown) {
  return Number(value || 0)
}

function normalizeBoolean(value: unknown) {
  return Number(Boolean(value)) as 0 | 1
}

function nextNumericId<T extends Record<string, unknown>>(rows: T[], field: keyof T & string) {
  return rows.reduce((max, row) => Math.max(max, Number(row[field] || 0)), 0) + 1
}

function formatCellValue(value: unknown) {
  if (typeof value === 'boolean') {
    return value ? 'Sim' : 'Nao'
  }

  if (value === 1 || value === 0) {
    return Number(value) === 1 ? 'Sim' : 'Nao'
  }

  if (value === null || value === undefined || value === '') {
    return '-'
  }

  return String(value)
}

export function SupportTablesPage({ pathname, onNavigate }: SupportPageProps) {
  const selectedSlug = pathname.startsWith('/cadastros/')
    ? pathname.replace('/cadastros/', '')
    : 'tipos-medicamentos'

  const entity = useMemo(
    () =>
      entityConfigs.find((item) => item.slug === selectedSlug) ||
      entityConfigs[0],
    [selectedSlug],
  )

  const [search, setSearch] = useState('*')
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [formState, setFormState] = useState<Record<string, unknown>>({})
  const [lookupState, setLookupState] = useState<LookupState>({
    diagnosticos: [],
    tiposMedicamentos: [],
    boname: [],
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    setSearch('*')
    setSuccessMessage('')
  }, [entity.key])

  useEffect(() => {
    let active = true

    async function loadLookups() {
      try {
        const [diagnosticos, tiposMedicamentos, boname] = await Promise.all([
          listSupportRows('diagnosticos'),
          listSupportRows('tipos-medicamentos'),
          listSupportRows('boname'),
        ])

        if (!active) {
          return
        }

        setLookupState({
          diagnosticos,
          tiposMedicamentos,
          boname,
        })
      } catch {
        if (!active) {
          return
        }

        setLookupState({
          diagnosticos: [],
          tiposMedicamentos: [],
          boname: [],
        })
      }
    }

    void loadLookups()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    async function loadRows() {
      setLoading(true)
      setErrorMessage('')

      try {
        const data = await listSupportRows(entity.key, entity.searchEnabled ? search || '*' : '*')

        if (!active) {
          return
        }

        const normalizedRows = (data as Record<string, unknown>[]) || []
        setRows(normalizedRows)

        if (!normalizedRows.length) {
          setSelectedId(null)
          setFormState(entity.createDefault([]))
          return
        }

        const currentRow =
          normalizedRows.find((row) => Number(row[entity.idField]) === selectedId) ||
          normalizedRows[0]

        setSelectedId(Number(currentRow[entity.idField]))
        setFormState({ ...currentRow })
      } catch (error) {
        if (!active) {
          return
        }

        setRows([])
        setSelectedId(null)
        setFormState(entity.createDefault([]))
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Nao foi possivel carregar os cadastros.',
        )
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadRows()

    return () => {
      active = false
    }
  }, [entity, search])

  const dependencyOptions = useMemo(
    () => ({
      diagnosticos: lookupState.diagnosticos.map((row) => ({
        value: row.diag_id,
        label: `${row.diag_id} - ${row.diag_descr}`,
      })),
      tiposMedicamentos: lookupState.tiposMedicamentos.map((row) => ({
        value: row.tipo_codigo,
        label: `${row.tipo_codigo} - ${row.tipo_descr}`,
      })),
      boname: lookupState.boname.map((row) => ({
        value: row.bona_codigo,
        label: `${row.bona_codigo} - ${row.bona_descr}`,
      })),
    }),
    [lookupState],
  )

  function handleSelectRow(row: Record<string, unknown>) {
    setSelectedId(Number(row[entity.idField]))
    setFormState({ ...row })
    setSuccessMessage('')
  }

  function handleNewRecord() {
    const nextForm = entity.createDefault(rows as never[])
    setSelectedId(null)
    setFormState(nextForm)
    setSuccessMessage('')
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!entity.canSave) {
      return
    }

    setSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await saveSupportRow(entity.key, entity.toPayload(formState))
      const reloaded = await listSupportRows(entity.key, entity.searchEnabled ? search || '*' : '*')
      const normalizedRows = reloaded as Record<string, unknown>[]
      const savedId = Number(formState[entity.idField] || 0)

      setRows(normalizedRows)
      setSelectedId(savedId || null)

      const savedRow =
        normalizedRows.find((row) => Number(row[entity.idField]) === savedId) ||
        normalizedRows[0] ||
        entity.createDefault([])

      setFormState({ ...savedRow })
      setSuccessMessage(`${entity.label} salvo com sucesso.`)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Nao foi possivel salvar o cadastro.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!entity.canDelete || !selectedId) {
      return
    }

    const confirmed = window.confirm(`Deseja excluir o registro selecionado de ${entity.label}?`)

    if (!confirmed) {
      return
    }

    setSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await deleteSupportRow(entity.key as Exclude<SupportEntityKey, 'tipos-requisicoes'>, selectedId)
      const reloaded = await listSupportRows(entity.key, entity.searchEnabled ? search || '*' : '*')
      const normalizedRows = reloaded as Record<string, unknown>[]

      setRows(normalizedRows)

      if (normalizedRows.length > 0) {
        setSelectedId(Number(normalizedRows[0][entity.idField]))
        setFormState({ ...normalizedRows[0] })
      } else {
        setSelectedId(null)
        setFormState(entity.createDefault([]))
      }

      setSuccessMessage('Registro excluido com sucesso.')
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Nao foi possivel excluir o cadastro.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <span className="eyebrow">Cadastros</span>
          <h1>Tabelas de apoio do modulo</h1>
          <p>
            Area operacional para consultar e manter os cadastros base usados por
            medicamentos, estoque, requisicoes e inventarios.
          </p>
        </div>

        <div className="summary-strip">
          <div className="summary-pill">
            <span>Modulo atual</span>
            <strong>{entity.label}</strong>
          </div>
          <div className="summary-pill">
            <span>Registros</span>
            <strong>{rows.length}</strong>
          </div>
          <div className="summary-pill">
            <span>Edicao</span>
            <strong>{entity.canSave ? 'Ativa' : 'Consulta'}</strong>
          </div>
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-card__header">
          <div>
            <span className="panel-kicker">Modulo</span>
            <h2>Escolha a tabela de apoio</h2>
          </div>
        </div>

        <div className="entity-switcher">
          {entityConfigs.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`entity-button ${item.key === entity.key ? 'entity-button--active' : ''}`}
              onClick={() => onNavigate(`/cadastros/${item.slug}`)}
            >
              <strong>{item.label}</strong>
            </button>
          ))}
        </div>
      </section>

      <section className="catalog-grid">
        <article className="panel-card">
          <div className="panel-card__header">
            <div>
              <span className="panel-kicker">{entity.listKicker}</span>
              <h2>{entity.label}</h2>
            </div>
            {entity.searchEnabled ? (
              <label className="search-inline">
                <span>Busca</span>
                <input
                  type="search"
                  placeholder="Pesquisar descricao ou codigo"
                  value={search === '*' ? '' : search}
                  onChange={(event) => setSearch(event.target.value || '*')}
                />
              </label>
            ) : null}
          </div>

          {loading ? (
            <StateBlock
              title="Carregando cadastros"
              description="Buscando registros da tabela selecionada."
            />
          ) : null}

          {!loading && errorMessage ? (
            <StateBlock
              tone="error"
              title="Falha ao carregar cadastros"
              description={errorMessage}
            />
          ) : null}

          {!loading && !errorMessage && rows.length === 0 ? (
            <StateBlock
              title="Nenhum registro encontrado"
              description="A tabela nao retornou registros para o filtro atual."
            />
          ) : null}

          {!loading && !errorMessage && rows.length > 0 ? (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    {entity.columns.map((column) => (
                      <th key={column.key}>{column.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const rowId = Number(row[entity.idField] || 0)

                    return (
                      <tr
                        key={rowId}
                        className={rowId === selectedId ? 'data-table__row--active' : ''}
                        onClick={() => handleSelectRow(row)}
                      >
                        {entity.columns.map((column) => (
                          <td key={column.key}>{formatCellValue(row[column.key])}</td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </article>

        <article className="panel-card">
          <div className="panel-card__header">
            <div>
              <span className="panel-kicker">Edicao</span>
              <h2>Formulario de apoio</h2>
            </div>
            <div className="form-actions">
              {entity.canCreate ? (
                <button type="button" className="button-secondary" onClick={handleNewRecord}>
                  Novo registro
                </button>
              ) : null}
              {entity.canDelete && selectedId ? (
                <button type="button" className="button-secondary" onClick={handleDelete}>
                  Excluir
                </button>
              ) : null}
            </div>
          </div>

          <p className="form-helper">{entity.description}</p>

          {entity.key === 'locais' ? (
            <div className="inline-note">
              <strong>Observacao</strong>
              <span>
                O backend atual aceita melhor a manutencao de locais existentes. Para novos
                registros, pode ser necessario ajustar a regra na API.
              </span>
            </div>
          ) : null}

          {!entity.canSave ? (
            <StateBlock
              title="Consulta somente leitura"
              description="Tipos de requisicoes estao disponiveis apenas para consulta nesta fase."
            />
          ) : (
            <form className="support-form" onSubmit={handleSave}>
              <div className="support-form__grid">
                {entity.fields.map((field) => {
                  const rawValue = formState[field.name]
                  const key = `${entity.key}-${field.name}`

                  if (field.type === 'checkbox') {
                    return (
                      <label key={key} className="check-field">
                        <input
                          type="checkbox"
                          checked={Boolean(rawValue)}
                          onChange={(event) =>
                            setFormState((current) => ({
                              ...current,
                              [field.name]: event.target.checked,
                            }))
                          }
                        />
                        <span>{field.label}</span>
                      </label>
                    )
                  }

                  if (field.type === 'select') {
                    const options = dependencyOptions[field.optionsKey || 'diagnosticos'] as LookupOption[]

                    return (
                      <label key={key} className="filter-control">
                        <span>{field.label}</span>
                        <select
                          value={String(rawValue ?? '')}
                          required={field.required}
                          disabled={field.readOnly}
                          onChange={(event) =>
                            setFormState((current) => ({
                              ...current,
                              [field.name]: event.target.value,
                            }))
                          }
                        >
                          <option value="">Selecione</option>
                          {options.map((option) => (
                            <option key={`${key}-${option.value}`} value={String(option.value)}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    )
                  }

                  return (
                    <label key={key} className="filter-control">
                      <span>{field.label}</span>
                      <input
                        type={field.type}
                        required={field.required}
                        placeholder={field.placeholder}
                        readOnly={field.readOnly}
                        value={String(rawValue ?? '')}
                        onChange={(event) =>
                          setFormState((current) => ({
                            ...current,
                            [field.name]:
                              field.type === 'number'
                                ? event.target.value
                                : event.target.value,
                          }))
                        }
                      />
                    </label>
                  )
                })}
              </div>

              <div className="form-status">
                {successMessage ? <span className="form-status__success">{successMessage}</span> : null}
                {errorMessage ? <span className="form-status__error">{errorMessage}</span> : null}
              </div>

              <div className="form-submit">
                <button type="submit" className="button-primary" disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar cadastro'}
                </button>
              </div>
            </form>
          )}
        </article>
      </section>
    </div>
  )
}
