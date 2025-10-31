import styles from './ExpirationDateHelp.module.css';
export const ExpirationDateHelp = () => {
 return <>
    <ul className={styles.list}>
      <li>The expiry date is set directly in the Verifiable Credential and cannot be changed without invalidating the cryptographic signature.</li>
      <li>Version 1 Verifiable Credentials set the date like so: <b>"expirationDate": "2025-01-09T16:23:24Z"</b></li>
      <li>Version 2 Verifiable Credentials set the date like so: <b>"validUntil": "2025-01-09T16:23:24Z"</b></li>
      <li>A credential is considered 'expired' after the given date.</li>
    </ul>
    <p className={styles.note}>Note that sometimes a credential is still useful even though it has expired. An expired driver's licence, for
      example, can still be used to prove our age. Or to prove that we were authorized to drive during a given period,
      which might be useful when applying for car insurance.
    </p>
  </>
}