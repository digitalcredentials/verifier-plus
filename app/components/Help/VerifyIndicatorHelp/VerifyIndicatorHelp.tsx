import styles from '../Help.module.css';
export const VerifyIndicatorHelp = () => {
 return <>
    <ul className={styles.list}>
      <li>An indication of the status of the credential.</li>
      <li>Four possible statuses: <b>Verified</b>, <b>Not Verified</b>, <b>Warning</b> or <b>Verifying...</b></li>
    </ul>
    <div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>
    We only flag a credential as <b>Not Verified</b> is if the credential has been tampered with 
    in some way or we can't otherwise verify the signature, or if the credential has been revoked. If the credential
    has expired or is from an issuer we don't recognize then we take a moderate approach
    and simply show a <b>Warning</b>. We do this because our verification page is primarily for education and 
    demonstration. A verification page for a university that verifies degrees would likely more strictly enforce 
    expiry, and would most certainly reject credentials from an unknown issuer.
    </div>
    <div className={styles.criteria}><div className={styles.criteriaTitle}>How we determine the result of this verification</div>
      <ul className={styles.list}>
      <li><b>Verifying</b> if verification is still in progress.</li>
      <li><b>Verified</b> if nothing has been tampered with, the credential hasn't expired, hasn't been revoked, and is from a known issuer.</li>
      <li><b>Not Verified</b> if the credential has been tampered with, the signature can't been checked, or the credential has been revoked.</li>
      <li><b>Warning</b> if the credential hasn't been tampered with, but has expired, or isn't from a known issuer.</li>
    </ul>
    </div>

    
  </>
}