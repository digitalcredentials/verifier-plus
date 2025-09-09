import type { NextPage } from 'next'
import useSWR from 'swr';
import styles from './[publicCredentialId].module.css'
import { CredentialCard } from 'components/CredentialCard/CredentialCard';
import { Container } from 'components/Container/Container';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useVerification } from 'lib/useVerification';
import { VerifiableCredential } from 'types/credential';
import { VerificationContext } from 'lib/verificationContext';
import { VerificationCard } from 'components/VerificationCard/VerificationCard';
import { TopBar } from 'components/TopBar/TopBar';
import { BottomBar } from 'components/BottomBar/BottomBar';
import { extractCredentialsFrom, VerifiableObject } from 'lib/verifiableObject';
import { LoadingError } from 'components/LoadingError/LoadingError';
import Link from "next/link";

interface CredentialVerificationProps {
  credential: VerifiableCredential;
}

const CredentialVerification: React.FC<CredentialVerificationProps> = ({
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

// @see https://nextjs.org/docs/basic-features/data-fetching/client-side#client-side-data-fetching-with-swr
// think this needed to be changed because of ts https://stackoverflow.com/questions/64199630/problem-with-typescript-while-making-request-to-swr
const fetcher = (input: RequestInfo, init: RequestInit, ...args: any[]) => fetch(input, init).then((res) => res.json());

const CredentialPage: NextPage = () => {
  // On page load, the credential is undefined, and is loaded and set
  // asynchronously from server-side API via `useSWR` hook
  const [credentials, setCredentials] = useState<VerifiableCredential[]>([]);
  const [isDark, setIsDark] = useState(false);

  const router = useRouter();
  const { publicCredentialId } = router.query;

  const extract = (data: {vp: VerifiableObject}) => {
    if (data !== undefined) {
      const vp = data.vp;
      const creds = extractCredentialsFrom(vp);
      setCredentials(creds || []);
    }
  }

  const { error } = useSWR(`/api/credentials/${publicCredentialId}`, fetcher, {onSuccess: extract});
  if (error) {
    return (
    <div className={styles.container}>
      <TopBar hasLogo={true} isDark={isDark} setIsDark={setIsDark} />
        <LoadingError/>
      <BottomBar isDark={isDark}/>
    </div>);
  }
  if (credentials.length === 0) {
    return (
      <main className={styles.container}>
      <TopBar isDark={isDark} setIsDark={setIsDark}/>
      <div className={styles.contentContainer}>
        <div>
        <Link href='/'>
              <div>
                <h1 className={styles.title}>
                  VerifierPlus
                </h1>
              </div>
        </Link>
        <h2 className={styles.errorTitle}>404: Credential Not Found</h2>
        <p className={styles.errorMessage}>
            Please confirm you have entered the correct URL or public link. <br/> Other reasons for this error could include:
        </p>
        <ul className={styles.errorList}>
            <li>The credential has expired</li>
            <li>The credential holder has unshared the URL or public link</li>
        </ul>
        </div>
       </div>
      <BottomBar isDark={isDark}/>
    </main>);  
  }

  return (
    <div className={styles.container}>
      <TopBar hasLogo={true} isDark={isDark} setIsDark={setIsDark} />
      {credentials.map((credential, index) => (
        <CredentialVerification credential={credential} key={index} />
      ))}
      <BottomBar isDark={isDark} />
    </div>
  )
}

export default CredentialPage
