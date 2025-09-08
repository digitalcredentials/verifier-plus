import {
  VerifiableCredential,
  VerifiableCredentialV1,
  VerifiableCredentialV2
} from '../types/credential.d';

function getIssuanceDateV1(credential: VerifiableCredential): string | undefined {
  return (credential as VerifiableCredentialV1).issuanceDate;
}

function getIssuanceDateV2(credential: VerifiableCredential): string | undefined {
  return (credential as VerifiableCredentialV2).validFrom;
}

export function getIssuanceDate(credential: VerifiableCredential): string | undefined {
  const issuanceDateV1 = getIssuanceDateV1(credential);
  const issuanceDateV2 = getIssuanceDateV2(credential);
  return issuanceDateV2 ?? issuanceDateV1;
}

function getExpirationDateV1(credential: VerifiableCredential): string | undefined {
  return (credential as VerifiableCredentialV1).expirationDate;
}

function getExpirationDateV2(credential: VerifiableCredential): string | undefined {
  return (credential as VerifiableCredentialV2).validUntil;
}

export function getExpirationDate(credential: VerifiableCredential): string | undefined {
  const expirationDateV1 = getExpirationDateV1(credential);
  const expirationDateV2 = getExpirationDateV2(credential);
  return expirationDateV2 ?? expirationDateV1;
}
