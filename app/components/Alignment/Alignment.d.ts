import type { Alignment as AlignmentType } from '@/types/credential.d'

export type AlignmentProps = {
  readonly alignment?: AlignmentType | AlignmentType[]
  readonly headerClassName?: string
}
