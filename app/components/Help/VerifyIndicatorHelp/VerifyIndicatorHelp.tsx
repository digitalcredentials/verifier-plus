import styles from '../Help.module.css';
export const VerifyIndicatorHelp = () => {
 return <>
    <ul className={styles.list}>
      <li>An indication of the status of the credential.</li>
      <li>Four possible statuses: <b>Verified</b>, <b>Not Verified</b>, <b>Warning</b> or <b>Verifying...</b></li>
    </ul>
    <p className={styles.note}><img src="./icons/info_24_lime.svg"></img>Note that the only criteria for 
    saying a credential is <b>Not Verified</b> is if the credential has been tampered with 
    in some way, or we can't verify the signature because we can't retrieve the public key. If the credential
    has expired, has been revoked or is from an issuer we don't recognize then we take a moderate approach
    and simply show a <b>Warning</b>. We do this because our verification page is primarily for education and 
    demonstration. A verification page for a university that verifies degrees would likely more strictly enforce 
    expiry, revocation, and would most certainly not accept credentials from an unknown issuer.
    </p>
    <p className={styles.criteria}><h1 className={styles.title}>How we determine the value of this field</h1>

      <ul className={styles.list}>
      <li><b>Verifying</b> if verification is still in progress.</li>
      <li><b>Verified</b> if nothing has been tampered with, the credential hasn't expired, hasn't been revoked, and is from a known issuer.</li>
      <li><b>Not Verified</b> if the credential has been tampered with.</li>
      <li><b>Warning</b> if the credential hasn't been tampered with, but has been revoked, has expired, or isn't from a known issuer.</li>
    </ul>
    </p>

    
  </>
}