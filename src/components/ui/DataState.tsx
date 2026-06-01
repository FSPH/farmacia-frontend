import type { ReactNode } from 'react'
import { Loader, Message, Placeholder } from 'rsuite'

export interface DataStateProps {
  action?: ReactNode
  description: string
  state: 'empty' | 'error' | 'loading'
  title: string
}

export function DataState({ action, description, state, title }: DataStateProps) {
  if (state === 'loading') {
    return (
      <div className="data-state data-state--loading">
        <Loader size="md" content={title} vertical />
        <p>{description}</p>
        <Placeholder.Paragraph rows={5} active />
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="data-state">
        <Message showIcon type="error" className="data-state__message">
          <strong>{title}</strong>
          <div>{description}</div>
        </Message>
        {action}
      </div>
    )
  }

  return (
    <div className="data-state data-state--empty">
      <strong>{title}</strong>
      <p>{description}</p>
      {action}
    </div>
  )
}

export default DataState
