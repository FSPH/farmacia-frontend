import { useCallback } from 'react'
import Swal, { type SweetAlertIcon, type SweetAlertOptions } from 'sweetalert2'

type MessageOptions = Pick<
  SweetAlertOptions,
  'allowOutsideClick' | 'confirmButtonText' | 'footer' | 'html' | 'icon' | 'text' | 'title'
>

type NotifyOptions = Pick<SweetAlertOptions, 'html' | 'icon' | 'position' | 'text' | 'timer' | 'title'>

type ConfirmOptions = Pick<
  SweetAlertOptions,
  'allowOutsideClick' | 'cancelButtonText' | 'confirmButtonText' | 'footer' | 'html' | 'icon' | 'text' | 'title'
>

const DEFAULT_ERROR_MESSAGE = 'Falha ao processar a solicitacao.'

const toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3200,
  timerProgressBar: true,
  heightAuto: false,
  customClass: {
    popup: 'app-alert__toast',
    title: 'app-alert__toast-title',
    htmlContainer: 'app-alert__toast-content',
  },
})

function withBaseOptions(options: SweetAlertOptions): SweetAlertOptions {
  return {
    heightAuto: false,
    buttonsStyling: false,
    reverseButtons: true,
    confirmButtonText: 'Entendi',
    cancelButtonText: 'Cancelar',
    ...options,
    customClass: {
      popup: 'app-alert__popup',
      title: 'app-alert__title',
      htmlContainer: 'app-alert__content',
      actions: 'app-alert__actions',
      confirmButton: 'rs-btn rs-btn-primary app-alert__button',
      cancelButton: 'rs-btn rs-btn-subtle app-alert__button',
      ...options.customClass,
    },
  }
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
  const message = useCallback((options: MessageOptions) => {
    return Swal.fire(withBaseOptions(options))
  }, [])

  const notify = useCallback((options: NotifyOptions) => {
    return toast.fire({
      icon: 'info',
      position: 'top-end',
      ...options,
    })
  }, [])

  const confirm = useCallback((options: ConfirmOptions) => {
    return Swal.fire(
      withBaseOptions({
        icon: 'warning',
        showCancelButton: true,
        focusCancel: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        ...options,
      }),
    )
  }, [])

  const showToast = useCallback(
    (icon: SweetAlertIcon, title: string, text?: string) => notify({ icon, title, text }),
    [notify],
  )

  return {
    confirm,
    error: (title: string, text?: string) => showToast('error', title, text),
    info: (title: string, text?: string) => showToast('info', title, text),
    message,
    notify,
    success: (title: string, text?: string) => showToast('success', title, text),
    warning: (title: string, text?: string) => showToast('warning', title, text),
  }
}

export default useAppAlert
