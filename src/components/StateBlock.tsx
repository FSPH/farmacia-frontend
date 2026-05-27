type StateBlockProps = {
  title: string
  description: string
  tone?: 'neutral' | 'error'
  actionLabel?: string
  onAction?: () => void
}

export function StateBlock({
  title,
  description,
  tone = 'neutral',
  actionLabel,
  onAction,
}: StateBlockProps) {
  return (
    <div className={`state-block state-block--${tone}`}>
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>

      {actionLabel && onAction ? (
        <button type="button" className="button-secondary" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
