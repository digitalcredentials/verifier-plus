import styles from '../Help.module.css';
export const WarningMessageHelp = () => {
 return <>
    <ul className={styles.list}>
      <li>A warning that something about the credential either couldn't be conclusively checked or there was a failing check despite which the credential might still be useful.</li>
      <li>It is very important to note that this site is for education and demonstration, and so we can be less strict with our checks.</li>
      <li>Verification sites for 'production' credentials would be more strict.</li>
    </ul>
    <div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>
    If the credential
    has expired or is from an issuer we don't recognize then we take a moderate approach
    and simply show the warning message. We do this because our verification page is primarily for education and 
    demonstration. A verification page for a university that verifies degrees would likely more strictly enforce 
    expiry, and would most certainly reject credentials from an unknown issuer.
    </div>
    <div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>
    It might happen during verification that a registry in which the signing DID is listed can't be reached, maybe 
    because of a server outage, or poor connection. This is another reason why we don't outright reject credentials whose
    signing DID can't be found in a registry. Again, a production site would likely show a much stronger message because
    fundamentally, if we don't recognize the signing DID, then we have no idea who it belongs to, and could just 
    as easily be fake as not.
    </div>
    <div className={styles.criteria}><div className={styles.criteriaTitle}>What produces a warning</div>
      <ul className={styles.list}>
      <li>The credential has expired.</li>
      <li>The credential was signed by an unrecognized DID (Decentralized Identifier), in other words, we couldn't find it in a registry.</li>
    </ul>
    </div>

    
  </>
}