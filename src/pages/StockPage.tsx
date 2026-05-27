import { useEffect, useState } from 'react'
import { StateBlock } from '../components/StateBlock'
import {
  getStockAlerts,
  listStock,
  type StockAlertFilter,
  type StockAlerts,
  type StockRow,
} from '../services/pharmacyApi'

type StockFilters = {
  q: string
  alerta: StockAlertFilter
}

const defaultFilters: StockFilters = {
  q: '',
  alerta: 'todos',
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(value))
}

function formatInteger(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value)
}

function getRowStatus(row: StockRow) {
  if (row.dias_para_vencer < 0) {
    return { label: 'Vencido', tone: 'danger' }
  }

  if (row.dias_para_vencer <= 90) {
    return { label: 'Vencendo', tone: 'warning' }
  }

  if (row.est_saldo <= Math.max(Number(row.med_min || 0), Number(row.med_alert || 0))) {
    return { label: 'Critico', tone: 'warning' }
  }

  return { label: 'Regular', tone: 'success' }
}

export function StockPage() {
  const [filters, setFilters] = useState(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters)
  const [rows, setRows] = useState<StockRow[]>([])
  const [alerts, setAlerts] = useState<StockAlerts | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isActive = true

    async function loadStock() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const [stockRows, alertsSummary] = await Promise.all([
          listStock(appliedFilters),
          getStockAlerts(),
        ])

        if (!isActive) {
          return
        }

        setRows(stockRows)
        setAlerts(alertsSummary)
      } catch (error) {
        if (!isActive) {
          return
        }

        setRows([])
        setAlerts(null)
        setErrorMessage(
          error instanceof Error ? error.message : 'Nao foi possivel carregar o estoque.',
        )
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadStock()

    return () => {
      isActive = false
    }
  }, [appliedFilters])

  return (
    <div className="page-stack">
      <section className="toolbar-card">
        <div className="toolbar-card__header">
          <div>
            <span className="panel-kicker">Consulta</span>
            <h2>Saldo e validade por lote</h2>
          </div>
        </div>

        <form
          className="page-toolbar"
          onSubmit={(event) => {
            event.preventDefault()
            setAppliedFilters(filters)
          }}
        >
          <label className="filter-control filter-control--wide">
            <span>Medicamento ou lote</span>
            <input
              type="search"
              placeholder="Buscar por descricao ou lote"
              value={filters.q}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  q: event.target.value,
                }))
              }
            />
          </label>

          <label className="filter-control">
            <span>Alerta</span>
            <select
              value={filters.alerta}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  alerta: event.target.value as StockAlertFilter,
                }))
              }
            >
              <option value="todos">Todos</option>
              <option value="critico">Critico</option>
              <option value="vencendo">Vencendo</option>
              <option value="vencido">Vencido</option>
            </select>
          </label>

          <div className="page-toolbar__actions">
            <button type="submit" className="button-primary">
              Atualizar estoque
            </button>
          </div>
        </form>
      </section>

      <section className="summary-grid">
        <article className="summary-card">
          <span>Itens em saldo</span>
          <strong>{formatInteger(rows.length)}</strong>
        </article>
        <article className="summary-card summary-card--warning">
          <span>Criticos</span>
          <strong>{formatInteger(alerts?.criticos.length || 0)}</strong>
        </article>
        <article className="summary-card summary-card--warning">
          <span>Vencendo</span>
          <strong>{formatInteger(alerts?.vencendo.length || 0)}</strong>
        </article>
        <article className="summary-card summary-card--danger">
          <span>Vencidos</span>
          <strong>{formatInteger(alerts?.vencidos.length || 0)}</strong>
        </article>
      </section>

      <section className="panel-card">
        <div className="panel-card__header">
          <div>
            <span className="panel-kicker">Monitoramento</span>
            <h2>Itens ativos em estoque</h2>
          </div>
          <span className="panel-tag">
            Filtro: {appliedFilters.alerta === 'todos' ? 'geral' : appliedFilters.alerta}
          </span>
        </div>

        {isLoading ? (
          <StateBlock
            title="Carregando estoque"
            description="Consultando saldos, lotes e validade por deposito."
          />
        ) : null}

        {!isLoading && errorMessage ? (
          <StateBlock
            tone="error"
            title="Falha ao carregar estoque"
            description={errorMessage}
            actionLabel="Tentar novamente"
            onAction={() => setAppliedFilters({ ...appliedFilters })}
          />
        ) : null}

        {!isLoading && !errorMessage && rows.length === 0 ? (
          <StateBlock
            title="Nenhum item encontrado"
            description="Nao ha registros para o filtro atual ou o backend ainda nao retornou saldo disponivel."
          />
        ) : null}

        {!isLoading && !errorMessage && rows.length > 0 ? (
          <div className="data-table__wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Medicamento</th>
                  <th>Deposito</th>
                  <th>Lote</th>
                  <th>Saldo</th>
                  <th>Validade</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const status = getRowStatus(row)

                  return (
                    <tr key={row.est_id}>
                      <td>
                        <strong>{row.med_descr}</strong>
                        <span className="table-subtitle">
                          {row.med_tipo_codigo} · {row.med_und}
                        </span>
                      </td>
                      <td>{row.dep_descr}</td>
                      <td>{row.est_lote}</td>
                      <td>{formatInteger(row.est_saldo)}</td>
                      <td>
                        {formatDate(row.est_validade)}
                        <span className="table-subtitle">
                          {row.dias_para_vencer} dia(s)
                        </span>
                      </td>
                      <td>
                        <span className={`table-pill table-pill--${status.tone}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  )
}
