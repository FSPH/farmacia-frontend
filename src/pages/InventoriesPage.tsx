import { useEffect, useState } from 'react'
import { StateBlock } from '../components/StateBlock'
import {
  listInventories,
  listInventoryItems,
  type InventoryItem,
  type InventoryStatusFilter,
  type InventorySummary,
} from '../services/pharmacyApi'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(value))
}

function formatInteger(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value)
}

export function InventoriesPage() {
  const [statusFilter, setStatusFilter] = useState<InventoryStatusFilter>('todos')
  const [inventories, setInventories] = useState<InventorySummary[]>([])
  const [selectedInventoryId, setSelectedInventoryId] = useState<number | null>(null)
  const [items, setItems] = useState<InventoryItem[]>([])
  const [listReloadKey, setListReloadKey] = useState(0)
  const [itemsReloadKey, setItemsReloadKey] = useState(0)
  const [isLoadingList, setIsLoadingList] = useState(true)
  const [isLoadingItems, setIsLoadingItems] = useState(false)
  const [listError, setListError] = useState('')
  const [itemsError, setItemsError] = useState('')

  useEffect(() => {
    let isActive = true

    async function loadInventories() {
      setIsLoadingList(true)
      setListError('')

      try {
        const response = await listInventories({ status: statusFilter })

        if (!isActive) {
          return
        }

        setInventories(response)
        setSelectedInventoryId((current) => {
          if (current && response.some((inventory) => inventory.inv_id === current)) {
            return current
          }

          return response[0]?.inv_id ?? null
        })
      } catch (error) {
        if (!isActive) {
          return
        }

        setInventories([])
        setSelectedInventoryId(null)
        setListError(
          error instanceof Error
            ? error.message
            : 'Nao foi possivel carregar os inventarios.',
        )
      } finally {
        if (isActive) {
          setIsLoadingList(false)
        }
      }
    }

    loadInventories()

    return () => {
      isActive = false
    }
  }, [statusFilter, listReloadKey])

  useEffect(() => {
    let isActive = true

    async function loadItems() {
      if (!selectedInventoryId) {
        setItems([])
        setItemsError('')
        return
      }

      setIsLoadingItems(true)
      setItemsError('')

      try {
        const response = await listInventoryItems(selectedInventoryId)

        if (!isActive) {
          return
        }

        setItems(response)
      } catch (error) {
        if (!isActive) {
          return
        }

        setItems([])
        setItemsError(
          error instanceof Error
            ? error.message
            : 'Nao foi possivel carregar os itens do inventario.',
        )
      } finally {
        if (isActive) {
          setIsLoadingItems(false)
        }
      }
    }

    loadItems()

    return () => {
      isActive = false
    }
  }, [selectedInventoryId, itemsReloadKey])

  const totalAbertos = inventories.filter((inventory) => inventory.inv_status === 0).length
  const totalFechados = inventories.filter((inventory) => inventory.inv_status === 1).length
  const totalDivergencias = inventories.reduce(
    (sum, inventory) => sum + Number(inventory.total_itens_divergentes || 0),
    0,
  )

  return (
    <div className="page-stack">
      <section className="toolbar-card">
        <div className="toolbar-card__header">
          <div>
            <span className="panel-kicker">Consulta</span>
            <h2>Controle de inventarios</h2>
          </div>
        </div>

        <div className="page-toolbar">
          <label className="filter-control">
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as InventoryStatusFilter)
              }
            >
              <option value="todos">Todos</option>
              <option value="abertos">Abertos</option>
              <option value="fechados">Fechados</option>
            </select>
          </label>
        </div>
      </section>

      <section className="summary-grid">
        <article className="summary-card">
          <span>Inventarios listados</span>
          <strong>{formatInteger(inventories.length)}</strong>
        </article>
        <article className="summary-card summary-card--warning">
          <span>Abertos</span>
          <strong>{formatInteger(totalAbertos)}</strong>
        </article>
        <article className="summary-card summary-card--success">
          <span>Fechados</span>
          <strong>{formatInteger(totalFechados)}</strong>
        </article>
        <article className="summary-card summary-card--warning">
          <span>Itens divergentes</span>
          <strong>{formatInteger(totalDivergencias)}</strong>
        </article>
      </section>

      <section className="inventory-layout">
        <article className="panel-card">
          <div className="panel-card__header">
            <div>
              <span className="panel-kicker">Listagem</span>
              <h2>Inventarios cadastrados</h2>
            </div>
          </div>

          {isLoadingList ? (
            <StateBlock
              title="Carregando inventarios"
              description="Consultando os ciclos de contagem disponiveis."
            />
          ) : null}

          {!isLoadingList && listError ? (
            <StateBlock
              tone="error"
              title="Falha ao carregar inventarios"
              description={listError}
              actionLabel="Tentar novamente"
              onAction={() => setListReloadKey((current) => current + 1)}
            />
          ) : null}

          {!isLoadingList && !listError && inventories.length === 0 ? (
            <StateBlock
              title="Nenhum inventario encontrado"
              description="O backend ainda nao retornou ciclos para o filtro selecionado."
            />
          ) : null}

          {!isLoadingList && !listError && inventories.length > 0 ? (
            <div className="inventory-list">
              {inventories.map((inventory) => (
                <button
                  key={inventory.inv_id}
                  type="button"
                  className={`inventory-card ${
                    inventory.inv_id === selectedInventoryId ? 'inventory-card--active' : ''
                  }`}
                  onClick={() => setSelectedInventoryId(inventory.inv_id)}
                >
                  <div className="inventory-card__header">
                    <strong>{inventory.dep_descr}</strong>
                    <span
                      className={`table-pill ${
                        inventory.inv_status === 1
                          ? 'table-pill--success'
                          : 'table-pill--warning'
                      }`}
                    >
                      {inventory.inv_status === 1 ? 'Fechado' : 'Aberto'}
                    </span>
                  </div>
                  <span className="table-subtitle">
                    {inventory.tipo_descr} · {inventory.inv_mes_ref}/{inventory.inv_ano_ref}
                  </span>
                  <div className="inventory-card__meta">
                    <span>{formatInteger(inventory.total_itens)} itens</span>
                    <span>{formatInteger(inventory.total_itens_divergentes)} divergencias</span>
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </article>

        <article className="panel-card">
          <div className="panel-card__header">
            <div>
              <span className="panel-kicker">Detalhamento</span>
              <h2>Itens do inventario selecionado</h2>
            </div>
            {selectedInventoryId ? (
              <span className="panel-tag">Inventario #{selectedInventoryId}</span>
            ) : null}
          </div>

          {selectedInventoryId === null && !isLoadingList ? (
            <StateBlock
              title="Nenhum inventario selecionado"
              description="Escolha um inventario na lista lateral para visualizar os itens contados."
            />
          ) : null}

          {selectedInventoryId !== null && isLoadingItems ? (
            <StateBlock
              title="Carregando itens do inventario"
              description="Consultando os lotes vinculados ao ciclo selecionado."
            />
          ) : null}

          {selectedInventoryId !== null && !isLoadingItems && itemsError ? (
            <StateBlock
              tone="error"
              title="Falha ao carregar itens"
              description={itemsError}
              actionLabel="Tentar novamente"
              onAction={() => setItemsReloadKey((current) => current + 1)}
            />
          ) : null}

          {selectedInventoryId !== null &&
          !isLoadingItems &&
          !itemsError &&
          items.length === 0 ? (
            <StateBlock
              title="Inventario sem itens"
              description="Nenhum lote foi retornado para este inventario."
            />
          ) : null}

          {selectedInventoryId !== null &&
          !isLoadingItems &&
          !itemsError &&
          items.length > 0 ? (
            <div className="data-table__wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Medicamento</th>
                    <th>Lote</th>
                    <th>Validade</th>
                    <th>Estoque</th>
                    <th>Contagem</th>
                    <th>Divergencia</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.iti_id}>
                      <td>
                        <strong>{item.med_descr}</strong>
                        <span className="table-subtitle">{item.med_und}</span>
                      </td>
                      <td>{item.iti_lote}</td>
                      <td>{formatDate(item.iti_validade)}</td>
                      <td>{formatInteger(item.iti_qtde_estoque)}</td>
                      <td>{formatInteger(item.iti_qtde_invent)}</td>
                      <td>
                        <span
                          className={`table-pill ${
                            item.iti_qtde_dif === 0
                              ? 'table-pill--success'
                              : 'table-pill--warning'
                          }`}
                        >
                          {formatInteger(item.iti_qtde_dif)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </article>
      </section>
    </div>
  )
}
