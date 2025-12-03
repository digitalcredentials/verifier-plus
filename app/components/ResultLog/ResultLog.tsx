'use client'
import { useState } from 'react';
import { CredentialError } from '@/types/credential.d';
import type { ResultItem, ResultLogProps } from './ResultLog.d';
import styles from './ResultLog.module.css';
import { StatusPurpose, hasStatusPurpose } from '@/lib/credentialStatus';
import { TestId } from "@/lib/testIds"
import { CredentialFormatHelp, validUntilHelpSections, KnownIssuerHelp, RegistryHelp, SignatureHelp } from '../Help';
import { ContextualHelp } from '../ContextualHelp/ContextualHelp';
import { RevocationHelp } from '../Help/RevocationHelp/RevocationHelp';

export enum LogId {
  ValidSignature = 'valid_signature',
  Expiration = 'expiration',
  IssuerDIDResolves = 'registered_issuer',
  RevocationStatus = 'revocation_status',
  SuspensionStatus = 'suspension_status'
}

export enum LogMessages {
  HasExpired = 'has expired',
  NoExpirationDate = 'no expiration date set',
  HasNotExpired = 'has not expired',
  GeneralError = 'There was an error verifing this credential.',
  UnknownError = 'There was an unknown error verifing this credential.',
  WellFormed = 'is correctly formatted',
  MalFormed = 'is not a recognized credential type',
  ValidSignature = 'has a valid signature',
  InvalidSignature = 'has an invalid signature',
  KnownIssuer = 'has been issued by a known issuer',
  UnknownIssuer = "isn't in a known issuer registry",
  NotRevoked = 'has not been revoked',
  Revoked = 'has been revoked',
  UncheckedRevocation = 'Revocation status could not be checked',
  NotSuspended = 'has not been suspended',
  Suspended = 'has been suspended'
}

export const ResultLog = ({ verificationResult }: ResultLogProps) => {
  const [moreInfo, setMoreInfo] = useState(false);


  const ResultItem = ({
    verified = true,
    positiveMessage = '',
    negativeMessage = '',
    warningMessage = '',
    sourceLogId = '',
    testId = '',
    helpTitle, 
    HelpContent,
    helpSections,
    issuer = false
  }: ResultItem) => {
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
      <div className={styles.resultItem} >
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
        <div data-testid={testId} style={{maxHeight: '1.5em', height: '1.5em'}}>
          {status === 'positive' && positiveMessage}
          {status === 'warning' && warningMessage}
          {status === 'negative' && negativeMessage}
          {(HelpContent || helpSections)&&<div style={{verticalAlign: 'top', display: 'inline-block'}}> <ContextualHelp title={helpTitle} sections={helpSections}><HelpContent/></ContextualHelp> </div>}  
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
          <p data-testid={TestId.GeneralErrorMsg} className={styles.error}>{LogMessages.GeneralError}</p>
          {error?.message && (
            <div className={styles.errorContainer}>
              <p data-testid={TestId.ReturnedErrorMsg}>{error.message}</p>
            </div>
          )}
        </div>
      )
    } else if (hasSigningError) {
      return (
        <div>
          <p data-testid={TestId.SigningErrorMsg} className={styles.error}>"This credential cannot be verified. Note that the JSON code is sensitive to changes in code text including spaces and characters. Please ensure you have input the correct code." <span className={styles.moreInfoLink} onClick={() => setMoreInfo(!moreInfo)}>More Info</span></p>
          {moreInfo && (
            <div className={styles.errorContainer}>
              <p>Something has changed in the credential so that the electronic signature no longer matches the content. This could be something as simple as inadvertently adding a space.</p>
            </div>
          )}
        </div>
      )
    } else if (hasUnknownError) {
      return (<div>
        <p data-testid={TestId.UnknownErrorMsg} className={styles.error}>{LogMessages.UnknownError} <span className={styles.moreInfoLink} onClick={() => setMoreInfo(!moreInfo)}>More Info</span></p>
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
        <div className={styles.resultLog} data-testid={TestId.ResultLog}>
          {/* <div className={styles.issuer}> */}
          {/* <div className={styles.header}>Issuer</div> */}

          <ResultItem
            verified={!isMalformedError}
            positiveMessage={LogMessages.WellFormed}
            negativeMessage={LogMessages.MalFormed}
            testId={TestId.MalformedLogMsg}
            HelpContent={CredentialFormatHelp}
            helpTitle="Supported Credential Format"
          />

          <ResultItem
            verified={logMap[LogId.ValidSignature] ?? true}
            positiveMessage={LogMessages.ValidSignature}
            negativeMessage={LogMessages.InvalidSignature}
            testId={TestId.SigningLogMsg}
            HelpContent={SignatureHelp}
            helpTitle="Valid Signature"
          />
          <ResultItem
            verified={logMap[LogId.IssuerDIDResolves] ?? true}
            positiveMessage={LogMessages.KnownIssuer}
            warningMessage={LogMessages.UnknownIssuer}
            sourceLogId={LogId.IssuerDIDResolves}
            testId={TestId.IssuerLogMsg}
            issuer={true}
            HelpContent={KnownIssuerHelp}
            helpTitle="Known Issuer"
          />

          {
            <ResultItem
              verified={logMap[LogId.RevocationStatus] !== undefined ? logMap[LogId.RevocationStatus] : true}
              positiveMessage={LogMessages.NotRevoked}
              negativeMessage={verificationResult.hasStatusError ? LogMessages.UncheckedRevocation : LogMessages.Revoked}
              testId={TestId.RevocationLogMsg}
              HelpContent={RevocationHelp}
              helpTitle="Revocation"
            />
          }
          {/* </div> */}
          {/* <div className={styles.credential}> */}
          {/* <div className={styles.header}>Credential</div> */}

          <ResultItem
            verified={expirationStatus === false ? false : true}
            positiveMessage={!expirationDateExists ? LogMessages.NoExpirationDate : LogMessages.HasNotExpired}
            warningMessage={LogMessages.HasExpired}
            sourceLogId={LogId.Expiration}
            testId={TestId.ExpirationLogMsg}
            HelpContent={validUntilHelpSections}
            helpTitle="Expiration Date"
          />

          {hasCredentialStatus && hasSuspensionStatus &&
            <ResultItem
              verified={logMap[LogId.SuspensionStatus] ?? true}
              positiveMessage={LogMessages.NotSuspended}
              negativeMessage={LogMessages.Suspended}
              testId={TestId.SuspensionLogMsg}
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
