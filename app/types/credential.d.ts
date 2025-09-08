export type IssuerURI = string;
export type IssuerObject = {
  readonly id: IssuerURI;
  readonly type?: string;
  readonly name?: string;
  readonly url?: string;
  readonly image?: string;
}
export type Issuer = IssuerURI | IssuerObject;

export type CreditValue = {
  value?: string;
}

export type CompletionDocument = {
  readonly type?: string;
  readonly identifier?: string;
  readonly name?: string;
  readonly description?: string;
  readonly numberOfCredits?: CreditValue;
  readonly startDate?: string;
  readonly endDate?: string;
}

export type EducationalOperationalCredentialExtensions = {
  readonly type?: string[];
  readonly awardedOnCompletionOf?: CompletionDocument;
}

export type EducationalOperationalCredential = EducationalOperationalCredentialExtensions & {
  readonly id: string;
  readonly name?: string;
  readonly description?: string;
  readonly competencyRequired?: string;
  readonly credentialCategory?: string;
}

export type OpenBadgeAchievement = {
  readonly achievementType?: string;
  readonly criteria?: {
        readonly narrative?: string
      };
  readonly description?: string;
  readonly id?: string;
  readonly name?: string;
  readonly type?: string;
  readonly image?: achievementImage;
}

type achievementImage = {
  readonly id?: string;
  readonly type?: string;
}

type SubjectExtensions = {
  readonly type?: string;
  readonly name?: string;
  readonly hasCredential?: EducationalOperationalCredential; // https://schema.org/hasCredential
  readonly achievement?: OpenBadgeAchievement;
  readonly identifier?: OBV3IdentifierObject | OBV3IdentifierObject[];
}

export type Subject = SubjectExtensions & {
  readonly id?: string;
}

export type OBV3IdentifierObject = {
  readonly identityType?: string;
  readonly identityHash?: string;
}

export type Proof = {
  type: string;
  created: string;
  verificationMethod: string;
  proofPurpose: string;
  proofValue?: string;
  challenge?: string;
  jws?: string;
  cryptosuite?: string;
}

// https://www.w3.org/TR/vc-bitstring-status-list
export type CredentialStatus = {
  readonly id: string;
  readonly type: string | string[];
  readonly statusPurpose: string;
  readonly statusListIndex: string | number;
  readonly statusListCredential: string;
}

export type RenderMethod = {
  id?: string;
  type: string;
  name?: string;
  css3MediaQuery?: string;
}

// https://www.w3.org/TR/vc-data-model/
export type VerifiableCredentialV1 = {
  readonly '@context': string[];         // https://www.w3.org/TR/vc-data-model/#contexts
  readonly id?: string;                  // https://www.w3.org/TR/vc-data-model/#identifiers
  readonly type: string[];               // https://www.w3.org/TR/vc-data-model/#types
  readonly issuer: Issuer;               // https://www.w3.org/TR/vc-data-model/#issuer
  readonly issuanceDate: string;         // https://www.w3.org/TR/vc-data-model/#issuance-date
  readonly expirationDate?: string;      // https://www.w3.org/TR/vc-data-model/#expiration
  readonly credentialSubject: Subject;   // https://www.w3.org/TR/vc-data-model/#credential-subject
  readonly credentialStatus?: CredentialStatus | CredentialStatus[]; // https://www.w3.org/TR/vc-data-model/#status
  readonly proof?: Proof;                // https://www.w3.org/TR/vc-data-model/#proofs-signatures
  readonly name?: string;
  readonly renderMethod?: RenderMethod[];
}

// https://www.w3.org/TR/vc-data-model-2.0/
// (At this time, this should be in sync with https://w3c.github.io/vc-data-model/)
export type VerifiableCredentialV2 = {
  readonly '@context': string[];         // https://www.w3.org/TR/vc-data-model-2.0/#contexts
  readonly id?: string;                  // https://www.w3.org/TR/vc-data-model-2.0/#identifiers
  readonly type: string[];               // https://www.w3.org/TR/vc-data-model-2.0/#types
  readonly issuer: Issuer;               // https://www.w3.org/TR/vc-data-model-2.0/#issuer
  readonly validFrom?: string;           // https://www.w3.org/TR/vc-data-model-2.0/#validity-period
  readonly validUntil?: string;          // https://www.w3.org/TR/vc-data-model-2.0/#validity-period
  readonly credentialSubject: Subject;   // https://www.w3.org/TR/vc-data-model-2.0/#credential-subject
  readonly credentialStatus?: CredentialStatus | CredentialStatus[]; // https://www.w3.org/TR/vc-data-model-2.0/#status
  readonly proof?: Proof;                // https://w3c.github.io/vc-data-model/#proofs-signatures
  readonly name?: string;
  readonly renderMethod?: RenderMethod[]; // https://www.w3.org/TR/vc-data-model-2.0/#reserved-extension-points
}

export type VerifiableCredential = VerifiableCredentialV1 | VerifiableCredentialV2;

export enum CredentialErrorTypes {
  IsNotVerified = 'Credential is not verified.',
  CouldNotBeVerified = 'Credential could not be checked for verification and may be malformed.',
  DidNotInRegistry = 'Could not find issuer in registry with given DID.',
}



export type ErrorDetails = {
  cause: ErrorCause;
  code?: string;
  url?: string;
}

export type CredentialError = {
  details: ErrorDetails,
  message: string,
  name: string,
  stack?: string,
  isFatal?: boolean,
  log?: any
}

export type ErrorCause = {
  message: string;
  name: string;
  stack?: string
}

export type VerifyResultLog = {
  id: string,
  valid: boolean
}

export type VerifyResult = {
  verified: boolean;
  credential: VerifiableCredential;
  error: CredentialError;
  log: VerifyResultLog[];
}

export type VerifyResponse = {
  hasStatusError?: any;
  verified: boolean;
  results: VerifyResult[];
  registryName?: string[];
}
