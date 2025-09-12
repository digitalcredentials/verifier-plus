import styles from './[publicCredentialId].module.css'
import { VerifiableCredential } from '@/types/credential';
import { extractCredentialsFrom } from '@/lib/verifiableObject';
import { LoadingError } from '@/components/LoadingError/LoadingError';
import Link from "next/link";
import { CredentialVerification } from '@/components/CredentialVerification/CredentialVerification'
import * as credentialsFetcher from '@/lib/credentials';

export default async function Page({
  params,
}: {
  params: Promise<{ publicCredentialId: string }>
}) {
  let credentials : VerifiableCredential[]
  try {
    const { publicCredentialId } = await params
    const credentialVP = await credentialsFetcher.get({ publicCredentialId });
    credentials = extractCredentialsFrom(credentialVP.vp) || []
  } catch (error) {
    console.log(error)
    return (<LoadingError />)
  }

  if (credentials.length === 0) {
    return (
      <div className={styles.contentContainer}>
        <Link href='/'>
          <div>
            <h1 className={styles.title}>
              VerifierPlus
            </h1>
          </div>
        </Link>
        <h2 className={styles.errorTitle}>404: Credential Not Found</h2>
        <p className={styles.errorMessage}>
          Please confirm you have entered the correct URL or public link. <br /> Other reasons for this error could include:
        </p>
        <ul className={styles.errorList}>
          <li>The credential has expired</li>
          <li>The credential holder has unshared the URL or public link</li>
        </ul>
      </div>
    )
  }

  return (
    <div>
      {credentials.map((credential, index) => (
        <CredentialVerification credential={credential} key={index} />
      ))}
    </div>
  )
}