
import React from 'react';
import styles from './RegistryCard.module.css';
import { TestId } from '@/lib/testIds';

type RegistryCardProps = {
  registryName: string;
  issuerName?: string;
  issuerId?: string;
  issuerLogo?: string | { id: string };
  issuerLegalName?: string;
  issuerUrl?: string;
  policyUrl?: string; // Uncomment if needed
};

export const RegistryCard: React.FC<RegistryCardProps> = ({ registryName, issuerName, issuerId, issuerLogo, issuerLegalName, issuerUrl,policyUrl }) => {
  return (
    <div className={styles.registryCard}>
      {/* <p className={styles.registryName}><strong>Issuer Details</strong></p> */}
      <strong className={styles.registryName}>{registryName}</strong>{' '}
      {policyUrl ? (
                <a href={policyUrl} target="_blank" rel="noopener noreferrer">
                    (More info on governance)
                </a>
              ) : null}

     

      <div className={styles.issuerMeta}>
      {issuerLogo && (
  <div className={styles.logoPlaceholder}>
    <img
      src={typeof issuerLogo === 'string' ? issuerLogo : issuerLogo.id}
      alt="Issuer Logo"
    />
  </div>
)}
        <div>
          {issuerName && (
            <p className={styles.registryName}>
              <strong>Issuer Name:</strong>{' '}
              <span data-testid={TestId.RegistryIssuerName}>
              {issuerUrl ? (
                <a href={issuerUrl} target="_blank" rel="noopener noreferrer">
                  {issuerName}
                </a>
              ) : (
                issuerName
              )}
              </span>
            </p>
          )}
          {issuerLegalName && (
            <p className={styles.registryName}>
              <strong  className={styles.registryName}>Legal Name:</strong> {issuerLegalName}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};