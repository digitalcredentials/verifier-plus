import type { VerifiableCredential } from 'types/credential';

export type CredentialCardProps = {
  credential?: VerifiableCredential,
  wasMulti?: Boolean
}

export type CredentialDisplayFields = {
  credentialName: string | undefined,
  issuedTo: string | undefined,
  issuanceDate: string | undefined,
  expirationDate: string | undefined,
  credentialDescription: string | undefined,
  criteria: string | undefined,
  achievementImage?: string | undefined,
  achievementType?: string | undefined,
}
