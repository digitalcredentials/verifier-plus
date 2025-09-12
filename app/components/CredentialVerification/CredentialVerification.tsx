'use client'
import { CredentialCard } from '@/components/CredentialCard/CredentialCard';
import { Container } from '@/components/Container/Container';

import { VerifiableCredential } from '@/types/credential';
import { useVerification } from '@/lib/useVerification';
import { VerificationContext } from '@/lib/verificationContext';
import { VerificationCard } from '@/components/VerificationCard/VerificationCard';

import styles from './CredentialVerification.module.css'

interface CredentialVerificationProps {
  credential: VerifiableCredential;
}

export const CredentialVerification: React.FC<CredentialVerificationProps> = ({
  credential,
}) => {
  const verificationContext = useVerification(credential);

  return (
    <div className={styles.verifyContainer}>
      <VerificationContext.Provider value={verificationContext}>
        <Container>
          <CredentialCard credential={credential} />
          <VerificationCard />
        </Container>
      </VerificationContext.Provider>
    </div>
  );
};