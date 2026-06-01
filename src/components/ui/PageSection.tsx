import type { ReactNode } from 'react'
import { HStack, Panel, VStack } from 'rsuite'

export interface PageSectionProps {
  actions?: ReactNode
  children: ReactNode
  className?: string
  description?: string
  title: string
}

export function PageSection({
  actions,
  children,
  className = '',
  description,
  title,
}: PageSectionProps) {
  return (
    <Panel bordered className={`page-section ${className}`.trim()}>
      <HStack justifyContent="space-between" alignItems="flex-start" className="page-section__header" wrap>
        <VStack spacing={4} alignItems="flex-start" className="page-section__copy">
          <h3>{title}</h3>
          {description ? <p>{description}</p> : null}
        </VStack>
        {actions ? <div className="page-section__actions">{actions}</div> : null}
      </HStack>
      <div className="page-section__body">{children}</div>
    </Panel>
  )
}

export default PageSection
