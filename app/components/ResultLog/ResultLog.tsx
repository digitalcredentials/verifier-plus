import { useState } from 'react';
import { CredentialError } from '@/types/credential.d';
import type { ResultLogProps } from './ResultLog.d';
import styles from './ResultLog.module.css';
import { StatusPurpose, hasStatusPurpose } from '@/lib/credentialStatus';

enum LogId {
  ValidSignature = 'valid_signature',
  Expiration = 'expiration',
  IssuerDIDResolves = 'registered_issuer',
  RevocationStatus = 'revocation_status',
  SuspensionStatus = 'suspension_status'
}

export const ResultLog = ({ verificationResult }: ResultLogProps) => {
  const [moreInfo, setMoreInfo] = useState(false);


  const ResultItem = ({
    verified = true,
    positiveMessage = '',
    negativeMessage = '',
    warningMessage = '',
    sourceLogId = '',
    issuer = false
  }) => {
    const isIssuerCheck = sourceLogId === LogId.IssuerDIDResolves;
    const isExpirationCheck = sourceLogId === LogId.Expiration;
    const status = verified
      ? 'positive'
      : isIssuerCheck || isExpirationCheck
        ? 'warning'
        : 'negative';

    const getStatusClass = () => {
      if (status === 'positive') return styles.verified;
      if (status === 'warning') return `${styles.warning} ${styles.warningIcon}`;
      return styles.notVerified;
    };

    return (
      <div className={styles.resultItem}>
        <span
          role="img"
          aria-label={
            status === 'positive'
              ? 'green checkmark'
              : status === 'warning'
                ? 'yellow warning'
                : 'red x'
          }
          className={`material-icons ${getStatusClass()}`}
        >
          {status === 'positive'
            ? 'check_circle'
            : status === 'warning'
              ? 'priority_high'
              : 'close'}
        </span>
        <div>
          {status === 'positive' && positiveMessage}
          {status === 'warning' && warningMessage}
          {status === 'negative' && negativeMessage}
        </div>
      </div>
    );
  };


  let logMap: { [x: string]: any; };
  let hasKnownError = false;
  let shouldShowKnownError = false;
  let hasUnknownError = false;
  let hasSigningError = false;
  let error: CredentialError;
  let hasResult = verificationResult.results[0];
  

  if (hasResult) {
    let log = []
    const result = verificationResult.results[0];
    const hasResultLog = !!result.log;
    const hasErrorLog = !!result.error?.log
    hasKnownError = !!result.error
    shouldShowKnownError = !!result.error?.isFatal
    if (hasKnownError) {
      error = result.error
      console.log('Error: ', error);
    }
    if (hasResultLog) {
      log = result.log
    } else if (hasErrorLog) {
      log = result.error.log
    }
    logMap = log.reduce((acc: Record<string, boolean>, logEntry: any) => {
      acc[logEntry.id] = logEntry.valid;
      return acc;
    }, {}) ?? {};

    hasSigningError = !logMap[LogId.ValidSignature];

  } else {
    hasUnknownError = true;
  }

  const renderResult = () => {
    const result = verificationResult.results[0];
    const isMalformedError =
    result?.error?.message ===
    'Credential could not be checked for verification and may be malformed.';
    const { credential } = result;
    if (shouldShowKnownError) {
      return (
        <div>
          <p className={styles.error}>There was an error verifing this credential.</p>
          {/* <p className={styles.error}>There was an error verifing this credential. <span className={styles.moreInfoLink} onClick={() => setMoreInfo(!moreInfo)}>More Info</span> </p> */}
          {/* {moreInfo && (
            <div className={styles.errorContainer}>
              <p>{error.message}</p>
            </div>
          )} */}
        </div>
      )
    } else if (hasSigningError) {
      return (
        <div>
          <p className={styles.error}>"This credential cannot be verified. Note that the JSON code is sensitive to changes in code text including spaces and characters. Please ensure you have input the correct code." <span className={styles.moreInfoLink} onClick={() => setMoreInfo(!moreInfo)}>More Info</span></p>
          {moreInfo && (
            <div className={styles.errorContainer}>
              <p>Something has changed in the credential so that the electronic signature no longer matches the content. This could be something as simple as inadvertently adding a space.</p>
            </div>
          )}
        </div>
      )
    } else if (hasUnknownError) {
      return (<div>
        <p className={styles.error}>There was an unknown error verifing this credential. <span className={styles.moreInfoLink} onClick={() => setMoreInfo(!moreInfo)}>More Info</span></p>
        {moreInfo && (
          <div className={styles.errorContainer}>
            <p>"Please try again, or let us know."</p>
          </div>
        )}
      </div>)

    } else {
      
      const hasCredentialStatus = credential.credentialStatus !== undefined;
      //const hasRevocationStatus = hasStatusPurpose(credential, StatusPurpose.Revocation);
      const hasSuspensionStatus = hasStatusPurpose(credential, StatusPurpose.Suspension);
      const expirationDateExists = 
  ('expirationDate' in credential && !!(credential as any).expirationDate) || 
  ('validUntil' in credential && !!(credential as any).validUntil);
      const expirationStatus = logMap[LogId.Expiration]; // could be true, false, or undefined

      return (
        <div className={styles.resultLog}>
          {/* <div className={styles.issuer}> */}
          {/* <div className={styles.header}>Issuer</div> */}

          <ResultItem
  verified={!isMalformedError}
  positiveMessage="is in a supported credential format"
  negativeMessage="is not a recognized credential type"
/>
         
          <ResultItem
            verified={logMap[LogId.ValidSignature] ?? true}
            positiveMessage="has a valid signature"
            negativeMessage="has an invalid signature"
          />
          <ResultItem
            verified={logMap[LogId.IssuerDIDResolves] ?? true}
            positiveMessage="has been issued by a known issuer"
            warningMessage="isn't in a known issuer registry"
            sourceLogId={LogId.IssuerDIDResolves}
            issuer={true}
          />

{ 
  <ResultItem
    verified={logMap[LogId.RevocationStatus] !== undefined ? logMap[LogId.RevocationStatus] : true}
    positiveMessage="has not been revoked"
    negativeMessage={verificationResult.hasStatusError ? "Revocation status could not be checked" : "has been revoked"}
  />
}
          {/* </div> */}
          {/* <div className={styles.credential}> */}
          {/* <div className={styles.header}>Credential</div> */}

          <ResultItem
            verified={expirationStatus === false ? false : true}
            positiveMessage={!expirationDateExists ? "no expiration date set" : "has not expired"}
            warningMessage="has expired"
            sourceLogId={LogId.Expiration}
          />

          {hasCredentialStatus && hasSuspensionStatus &&
            <ResultItem
              verified={logMap[LogId.SuspensionStatus] ?? true}
              positiveMessage="has not been suspended"
              negativeMessage="has been suspended"
            />}


          {/* </div> */}
        </div>
      )
    }
  }

  return (
    renderResult()
  );
}
