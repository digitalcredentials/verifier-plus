import styles from '../Help.module.css';

export const IssuerDetailsHelp = () => {
  return <>
   <ul className={styles.list}>
        <li>Typically whoever signed the Verifiable Credential, for example, a university that issues students Verifiable Credentials confirming their degrees.</li>
        <li>The issuer is described in the <b>issuer</b> property of the Verifiable Credential.</li>
        <li>The issuer may also be described in an <b>'issuer registry'</b> completely separate from the credential.</li>
        <li>The LCW and VerifierPlus use issuer details from our registry in preference to the details in the VC.</li>
        <li>An issuer's DID <b>MUST</b> be listed in a trusted registry in order for VCs issued with that DID to be trusted.</li>
      </ul>
      <div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>
      We always show issuer details from the registry (when available) rather than from the credential itself as a safeguard against the possibility that someone used the signing key to issue
      credentials in which they've claimed to be a different issuer.
      </div>

          <div  className={styles.criteria}><div className={styles.criteriaTitle}>How we determine the issuer details.</div>
           <div className={styles.preference}>In order of preference:</div>
            <ul className={styles.list}>
            <li>If the issuer is listed in a registry, we pull the issuer name, logo, and url from the registry.</li>
            <li>If the issuer is listed in more than one registry we use the first registry in our ordered list of registries.</li>
            <li>If the issuer is not in a registry we use:</li>
              <ul>
                <li>Logo: issuer.image.id otherwise issuer.image</li>
                <li>Name: issuer.name</li>
                <li>URL: issuer.url</li>
              </ul>
          </ul>
          </div>
  </>
}