import { useEffect, useState } from 'react'
import { StateBlock } from '../components/StateBlock'
import {
  listRequisitions,
  type RequisitionRow,
  type RequisitionStatus,
} from '../services/pharmacyApi'

type RequisitionFilters = {
  dataInicio: string
  dataFim: string
  status: RequisitionStatus
}

function toDateInputValue(date: Date) {
  const timezoneOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10)
}

function getDefaultFilters(): RequisitionFilters {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  return {
    dataInicio: toDateInputValue(startOfMonth),
    dataFim: toDateInputValue(now),
    status: 'todos',
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(value))
}

function formatInteger(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value)
}

export function RequisitionsPage() {
  const [filters, setFilters] = useState<RequisitionFilters>(getDefaultFilters)
  const [appliedFilters, setAppliedFilters] = useState<RequisitionFilters>(getDefaultFilters)
  const [rows, setRows] = useState<RequisitionRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isActive = true

    async function loadRequisitions() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const response = await listRequisitions(appliedFilters)

        if (!isActive) {
          return
        }

        setRows(response)
      } catch (error) {
        if (!isActive) {
          return
        }

        setRows([])
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Nao foi possivel carregar as requisicoes.',
        )
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadRequisitions()

    return () => {
      isActive = false
    }
  }, [appliedFilters])

  const totalAprovadas = rows.filter((row) => row.aprovado === 1).length
  const totalPendentes = rows.length - totalAprovadas
  const volumeTotal = rows.reduce((sum, row) => sum + Number(row.quantidade || 0), 0)

  return (
    <div className="page-stack">
      <section className="toolbar-card">
        <div className="toolbar-card__header">
          <div>
            <span className="panel-kicker">Consulta</span>
            <h2>Fila de requisicoes por periodo</h2>
          </div>
        </div>

        <form
          className="page-toolbar"
          onSubmit={(event) => {
            event.preventDefault()
            setAppliedFilters(filters)
          }}
        >
          <label className="filter-control">
            <span>Data inicial</span>
            <input
              type="date"
              value={filters.dataInicio}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  dataInicio: event.target.value,
                }))
              }
            />
          </label>

          <label className="filter-control">
            <span>Data final</span>
            <input
              type="date"
              value={filters.dataFim}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  dataFim: event.target.value,
                }))
              }
            />
          </label>

          <label className="filter-control">
            <span>Status</span>
            <select
              value={filters.status}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  status: event.target.value as RequisitionStatus,
                }))
              }
            >
              <option value="todos">Todos</option>
              <option value="pendentes">Pendentes</option>
              <option value="aprovadas">Aprovadas</option>
            </select>
          </label>

          <div className="page-toolbar__actions">
            <button type="submit" className="button-primary">
              Atualizar fila
            </button>
          </div>
        </form>
      </section>

      <section className="summary-grid">
        <article className="summary-card">
          <span>Total no periodo</span>
          <strong>{formatInteger(rows.length)}</strong>
        </article>
        <article className="summary-card summary-card--success">
          <span>Aprovadas</span>
          <strong>{formatInteger(totalAprovadas)}</strong>
        </article>
        <article className="summary-card summary-card--warning">
          <span>Pendentes</span>
          <strong>{formatInteger(totalPendentes)}</strong>
        </article>
        <article className="summary-card">
          <span>Volume solicitado</span>
          <strong>{formatInteger(volumeTotal)}</strong>
        </article>
      </section>

      <section className="panel-card">
        <div className="panel-card__header">
          <div>
            <span className="panel-kicker">Listagem</span>
            <h2>Requisicoes assistenciais</h2>
          </div>
          <span className="panel-tag">
            {appliedFilters.dataInicio} ate {appliedFilters.dataFim}
          </span>
        </div>

        {isLoading ? (
          <StateBlock
            title="Carregando requisicoes"
            description="Consultando a fila assistencial no backend."
          />
        ) : null}

        {!isLoading && errorMessage ? (
          <StateBlock
            tone="error"
            title="Falha ao carregar requisicoes"
            description={errorMessage}
            actionLabel="Tentar novamente"
            onAction={() => setAppliedFilters({ ...appliedFilters })}
          />
        ) : null}

        {!isLoading && !errorMessage && rows.length === 0 ? (
          <StateBlock
            title="Nenhuma requisicao encontrada"
            description="Ajuste o periodo ou aguarde novas solicitacoes para visualizar a fila."
          />
        ) : null}

        {!isLoading && !errorMessage && rows.length > 0 ? (
          <div className="data-table__wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Paciente</th>
                  <th>Medicamento</th>
                  <th>Lote</th>
                  <th>Deposito</th>
                  <th>Quantidade</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{formatDate(row.data)}</td>
                    <td>{row.paciente || 'Sem paciente'}</td>
                    <td>
                      <strong>{row.medicamento}</strong>
                      <span className="table-subtitle">
                        {row.tipo_descr || row.tipo_codigo} · {row.local_descr || 'Local nao informado'}
                      </span>
                    </td>
                    <td>{row.lote}</td>
                    <td>{row.deposito_descr || 'Sem deposito'}</td>
                    <td>
                      {formatInteger(row.quantidade)} {row.unidade}
                    </td>
                    <td>
                      <span
                        className={`table-pill ${
                          row.aprovado === 1 ? 'table-pill--success' : 'table-pill--warning'
                        }`}
                      >
                        {row.aprovado === 1 ? 'Aprovada' : 'Pendente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  )
}
