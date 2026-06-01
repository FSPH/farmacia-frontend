import { Message, Notification, toaster } from 'rsuite'

type AlertType = 'error' | 'info' | 'success' | 'warning'

type MessageOptions = {
  icon?: AlertType
  text?: string
  title: string
}

type NotifyOptions = {
  icon?: AlertType
  text?: string
  title: string
}

const DEFAULT_ERROR_MESSAGE = 'Falha ao processar a solicitacao.'

function pushNotification(type: AlertType, title: string, text?: string) {
  toaster.push(
    <Notification closable type={type} header={title} className="app-notification">
      {text ? <p className="app-notification__content">{text}</p> : null}
    </Notification>,
    {
      duration: 3600,
      placement: 'topEnd',
    },
  )
}

export function getErrorMessage(error: unknown, fallbackMessage = DEFAULT_ERROR_MESSAGE): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  if (typeof error === 'string' && error.trim()) {
    return error
  }

  return fallbackMessage
}

export function useAppAlert() {
  return {
    error: (title: string, text?: string) => pushNotification('error', title, text),
    info: (title: string, text?: string) => pushNotification('info', title, text),
    message: ({ icon = 'info', text, title }: MessageOptions) => {
      toaster.push(
        <Message showIcon type={icon} className="app-notification">
          <strong>{title}</strong>
          {text ? <div className="app-notification__content">{text}</div> : null}
        </Message>,
        {
          duration: 3200,
          placement: 'topEnd',
        },
      )

      return Promise.resolve()
    },
    notify: ({ icon = 'info', text, title }: NotifyOptions) => pushNotification(icon, title, text),
    success: (title: string, text?: string) => pushNotification('success', title, text),
    warning: (title: string, text?: string) => pushNotification('warning', title, text),
  }
}

export default useAppAlert
