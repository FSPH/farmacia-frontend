import type { ReactNode } from 'react'
import { Loader, Modal } from 'rsuite'

export type AppModalIntent = 'confirm' | 'create' | 'delete' | 'edit' | 'map' | 'payment' | 'view'

export interface AppModalProps {
  children: ReactNode
  footer?: ReactNode
  intent?: AppModalIntent
  loading?: boolean
  onClose: () => void
  open: boolean
  size?: 'full' | 'lg' | 'md' | 'sm' | 'xs'
  subtitle?: string
  title: string
}

const INTENT_LABELS: Record<AppModalIntent, string> = {
  confirm: 'Confirmacao',
  create: 'Cadastro',
  delete: 'Exclusao',
  edit: 'Edicao',
  map: 'Mapa / rota',
  payment: 'Pagamento',
  view: 'Visualizacao',
}

export function AppModal({
  children,
  footer,
  intent = 'view',
  loading = false,
  onClose,
  open,
  size = 'md',
  subtitle,
  title,
}: AppModalProps) {
  return (
    <Modal open={open} size={size} onClose={onClose} className={`app-modal app-modal--${intent}`}>
      <Modal.Header>
        <div className="app-modal__header">
          <div className="app-modal__copy">
            <Modal.Title>{title}</Modal.Title>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          <span className="app-modal__intent">{INTENT_LABELS[intent]}</span>
        </div>
      </Modal.Header>

      <Modal.Body>
        {loading ? (
          <div className="app-modal__loading">
            <Loader size="md" content="Carregando dados..." vertical />
          </div>
        ) : (
          children
        )}
      </Modal.Body>

      {footer ? <Modal.Footer className="app-modal__footer">{footer}</Modal.Footer> : null}
    </Modal>
  )
}

export default AppModal
