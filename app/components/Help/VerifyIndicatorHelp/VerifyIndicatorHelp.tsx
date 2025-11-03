import styles from '../Help.module.css';
export const VerifyIndicatorHelp = () => {
 return <>
    <ul className={styles.list}>
      <li>An indication of the status of the credential.</li>
      <li>Four possible statuses: <b>Verified</b>, <b>Not Verified</b>, <b>Warning</b> or <b>Verifying...</b></li>
    </ul>
    <p className={styles.note}><img src="./icons/info_24_lime.svg"></img>Note that we only flag a credential as <b>Not Verified</b> is if the credential has been tampered with 
    in some way or we can't otherwise verify the signature, or the credential has been revoked. If the credential
    has expired or is from an issuer we don't recognize then we take a moderate approach
    and simply show a <b>Warning</b>. We do this because our verification page is primarily for education and 
    demonstration. A verification page for a university that verifies degrees would likely more strictly enforce 
    expiry, and would most certainly not accept credentials from an unknown issuer.
    </p>
    <p className={styles.criteria}><h1 className={styles.title}>How we determine the value of this field</h1>

      <ul className={styles.list}>
      <li><b>Verifying</b> if verification is still in progress.</li>
      <li><b>Verified</b> if nothing has been tampered with, the credential hasn't expired, hasn't been revoked, and is from a known issuer.</li>
      <li><b>Not Verified</b> if the credential has been tampered with, the signature can't been checked, or has been revoked.</li>
      <li><b>Warning</b> if the credential hasn't been tampered with, but has expired, or isn't from a known issuer.</li>
    </ul>
    </p>

    
  </>
}