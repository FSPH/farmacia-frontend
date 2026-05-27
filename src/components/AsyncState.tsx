import type { ReactNode } from 'react'

type AsyncStateProps = {
  loading: boolean
  error: string
  isEmpty: boolean
  emptyMessage: string
  children: ReactNode
}

export function AsyncState({
  loading,
  error,
  isEmpty,
  emptyMessage,
  children,
}: AsyncStateProps) {
  if (loading) {
    return (
      <div className="state-block">
        <strong>Carregando dados</strong>
        <p>Aguarde enquanto buscamos as informacoes mais recentes da operacao.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="state-block state-block--error">
        <strong>Falha na consulta</strong>
        <p>{error}</p>
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="state-block">
        <strong>Nenhum registro encontrado</strong>
        <p>{emptyMessage}</p>
      </div>
    )
  }

  return <>{children}</>
}
