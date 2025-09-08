import * as verifierCore from '@digitalcredentials/verifier-core';
import type { VerifiablePresentation } from '@/types/presentation.d';
import type { VerifiableCredential, CredentialError } from '@/types/credential.d';
//import { CredentialErrorTypes } from '@/types/credential.d';
//import { KnownDidRegistries } from './../data/knownRegistries'

const NOT_VERIFIED_ERROR = 'Presentation encoded could not be checked for verification and may be malformed.'

enum CredentialErrorTypes {
  IsNotVerified = 'Credential is not verified.',
  CouldNotBeVerified = 'Credential could not be checked for verification and may be malformed.',
  DidNotInRegistry = 'Could not find issuer in registry with given DID.',
}


export type ResultLog = {
  id: string,
  valid: boolean,
  foundInRegistries?: string[],
  error?: any
}

export type Result = {
  verified: boolean;
  credential: VerifiableCredential;
  error: CredentialError;
  log: ResultLog[];
  registryName?: string;
}

export type VerifyResponse = {
  verified: boolean;
  results: Result[];
}

export async function verifyPresentation(
  presentation: VerifiablePresentation,
): Promise<VerifyResponse> {
  try {
    const result = await verifierCore.verifyPresentation({
      presentation
    });

    return result;
  } catch (err) {
    console.warn(err);
    throw new Error(NOT_VERIFIED_ERROR);
  }
}

export async function verifyCredential(credential: VerifiableCredential): Promise<VerifyResponse> {
  try {
    /*
    basic structure of object returned from verifyCredential call
    {
        verified: false,
        results: [{credential, verified: false, error}],
        error
      };
    */

      const response = await fetch("https://digitalcredentials.github.io/dcc-known-registries/known-did-registries.json");
      const knownDIDRegistries = await response.json();

    const result = await verifierCore.verifyCredential({
      credential,
      knownDIDRegistries: knownDIDRegistries
    });
    result.verified = Array.isArray(result.log)
      ? result.log.every((check: { valid: any; }) => check.valid)
      : false;
    if (result?.errors) {
      return createFatalErrorResult(credential, CredentialErrorTypes.CouldNotBeVerified);
    }
    if (!result.results) {
      result.results = [{
        verified: (result.log as ResultLog[]).every(check => check.valid),
        log: result.log,
        credential: result.credential
      }];
    }

    if (result?.verified === false) {
      const revocationIndex = (result.log as ResultLog[]).findIndex(
        c => c.id === 'revocation_status'
      );

      if (revocationIndex !== -1) {
        const revocationObject = result.log[revocationIndex];

        if (revocationObject?.error?.name === 'status_list_not_found') {
          (result.log as ResultLog[]).splice(revocationIndex, 1);

          // Re-evaluate verification result based on remaining logs
          result.verified = (result.log as ResultLog[]).every(log => log.valid);
        } else {
          const revocationResult = {
            id: 'revocation_status',
            valid: revocationObject.valid ?? false,
          };

          (result.results[0].log ??= []).push(revocationResult);
          result.hasStatusError = !!revocationObject.error;
        }
      }
    }
    
    if (result.log) {
      const registryNames = (result.log as ResultLog[]).find(c => c.id === "registered_issuer")?.foundInRegistries || [];
      result.registryName = registryNames;
    } else {
      result.verified = false;
      (result.results[0].log ??= []).push({ id: 'registered_issuer', valid: false })
      addErrorToResult(result, CredentialErrorTypes.DidNotInRegistry, false)
    }
    return result;
  } catch (err) {
    console.warn(err);
    //throw new Error(CredentialErrorTypes.CouldNotBeVerified);
    return createFatalErrorResult(credential, CredentialErrorTypes.CouldNotBeVerified)
  }
}
function createFatalErrorResult(credential: VerifiableCredential, message: string): VerifyResponse {
  const result = {
    verified: false,
    results: [
      {
        verified: false,
        credential: credential,
        log: [
          { id: 'expiration', valid: false },
          { id: 'valid_signature', valid: false },
          { id: 'issuer_did_resolves', valid: false },
          { id: 'revocation_status', valid: false }
        ]
      }
    ]
  }
  addErrorToResult(result, message, true)
  return result as VerifyResponse
}

function addErrorToResult(result: any, message: string, isFatal: boolean = true) {
  result.results[0].error =
  {
    details: {
      cause: {
        message,
        name: 'Error',
      },
    },
    message,
    name: 'Error',
    isFatal
  }
}