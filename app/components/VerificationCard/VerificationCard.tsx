import { ResultLog } from '@/components/ResultLog/ResultLog';
import React from 'react';
import { VerificationControls } from '@/components/VerificationControls/VerificationControls';
import { useVerificationContext } from '@/lib/verificationContext';
import { VerifyResponse } from '@/types/credential';
import styles from './VerificationCard.module.css';
import { RegistryCard } from '@/components/RegistryCard/RegistryCard';
import { TestId } from '@/lib/testIds';
import { ContextualHelp } from '../ContextualHelp/ContextualHelp';
import { RegistryListHelp } from '../Help';

export const UNSUCCESSFUL_VERIFICATION_MSG = 'This credential was not verified successfully.';
export const VERIFICATION_WARNING_MSG = 'There is a warning about this credential.'

export const VerificationCard = () => {
  const { loading, verificationResult, verifyCredential } = useVerificationContext();

  const ErrorMessage = () => {
    const result = (verificationResult as VerifyResponse)?.results?.[0];
    const log = result?.log ?? [];
    // Build a lookup of log validity
    const details = log.reduce<Record<string, boolean>>((acc, entry) => {
      acc[entry.id] = entry.valid;
      return acc;
    }, {});

    // Set missing expected keys to false
    ['valid_signature', 'expiration', 'registered_issuer'].forEach(key => {
      if (!(key in details)) {
        details[key] = false;
      }
    });

    const hasFailure = ['valid_signature', 'revocation_status'].some(
      key => details[key] === false
    );

    const hasWarning = ['expiration', 'registered_issuer'].some(
      key => details[key] === false
    );

    if (hasFailure) {
      return <div className={`${styles.error} ${styles.message}`} data-testid={TestId.VerificationMessage}>
              {UNSUCCESSFUL_VERIFICATION_MSG}
        </div>

    } else if (hasWarning) {
      return <div className={`${styles.warning} ${styles.message}`} data-testid={TestId.VerificationMessage}>
              {VERIFICATION_WARNING_MSG}
        </div>
    } 

    return null
  };


  return (
    <div className={styles.card}>
      <div className={styles.verification}>
        {loading ? (
          <div className={styles.loadingIndicator}>
            <span className="material-icons">sync</span>
            Verifying
          </div>
        ) : (
          <VerificationControls
            verificationResult={verificationResult as VerifyResponse}
            verifyCredential={verifyCredential}
          />
        )}
      </div>

      <div className={styles.resultLog}>
        {loading ? (
          <div className={styles.loadingMessage}>
            Please wait while we verify your credential.
          </div>
        ) : (
          <>
            <ErrorMessage/>
            <div className={styles.issuerDetails}>
              {(() => {
                const result = (verificationResult as VerifyResponse)?.results?.[0];
                const logEntry = result?.log?.find(log => log.id === 'registered_issuer');
                const credential = result?.credential;
                const rawIssuer = credential?.issuer;

                const issuer =
                  typeof rawIssuer === 'object' && rawIssuer !== null
                    ? (rawIssuer as {
                        name?: string;
                        id?: string;
                        image?: { id?: string };
                        legalName?: string;
                        url?: string;
                      })
                    : undefined;

                const matchingIssuers = (logEntry as any)?.matchingIssuers;

                if (Array.isArray(matchingIssuers) && matchingIssuers.length > 0) {
                  return (
                    <>
                      <p className={styles.registryName}>
                        <strong>Issuer Registration</strong><ContextualHelp title="Registry List"><RegistryListHelp/></ContextualHelp>
                      </p>
                      {matchingIssuers.map((match: any, index: number) => {
                        const registryName =
                          match?.registry?.federation_entity?.organization_name ??
                          'Unknown Registry';

                        const issuerOrg =
                          match?.issuer?.federation_entity?.organization_name ??
                          issuer?.name;

                        const issuerLegalName =
                          match?.issuer?.institution_additional_information?.legal_name ??
                          issuer?.legalName;

                        const issuerLogo =
                          match?.issuer?.federation_entity?.logo_uri ??
                          (typeof issuer?.image === 'string'
                            ? issuer.image
                            : issuer?.image?.id);

                        const issuerUrl =
                          match?.issuer?.federation_entity?.homepage_uri ??
                          issuer?.url;

                        const policyUrl =
                          match?.registry?.federation_entity?.policy_uri;

                        return (
                          <React.Fragment key={index}>
                            <RegistryCard
                              registryName={registryName}
                              issuerName={issuerOrg}
                              issuerId={issuer?.id}
                              issuerLogo={issuerLogo}
                              issuerLegalName={issuerLegalName}
                              issuerUrl={issuerUrl}
                              policyUrl={policyUrl}
                            />
                            {index < matchingIssuers.length - 1 && (
                              <hr className={styles.divider} />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </>
                  );
                }

                return null;
              })()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
