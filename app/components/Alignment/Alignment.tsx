"use client"
import styles from './Alignment.module.css'
import type { Alignment as AlignmentType } from '@/types/credential.d'
import { isValidHttpUrl } from '@/lib/url'
import type { AlignmentProps } from './Alignment.d'
import { TestId } from '@/lib/testIds'

export const Alignment = ({ alignment, headerClassName }: AlignmentProps) => {
  const alignmentsArray: AlignmentType[] = Array.isArray(alignment) ? alignment : (alignment ? [alignment] : [])
  const items = (alignmentsArray ?? [])
    .map(a => ({
      ...a,
      targetName: (a?.targetName ?? '').trim(),
      targetUrl: (a?.targetUrl ?? '').trim()
    }))
    .filter(a => !!a.targetName)
  if (items.length === 0) return null

  return (
    <section className={styles.container} data-testid={TestId.Alignment}>
      <h3 className={headerClassName ?? styles.header}>Alignments</h3>
      <ul className={styles.list}>
        {items.map((a, idx) => (
          <li key={`${a.targetUrl || a.targetName}-${idx}`} className={styles.item}>
            <p className={styles.name}>{a.targetName}</p>
            {a.targetUrl && (
              <p className={styles.url}>
                {isValidHttpUrl(a.targetUrl) ? (
                  <a href={a.targetUrl} target="_blank" rel="noreferrer noopener">{a.targetUrl}</a>
                ) : (
                  a.targetUrl
                )}
              </p>
            )}
            {a.targetDescription && (
              <p className={styles.description}>{a.targetDescription}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Alignment