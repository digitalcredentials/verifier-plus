import styles from '../Help.module.css';
export const SignatureHelp = () => {
 return <>
    <ul className={styles.list}>
      <li>Verifies that the cryptographic signature in the credential matches the content, in other words, verifies that the credential has not been tampered with.</li>
      <li>Fails if the public signing key cannot be retrieved from the DID document of the DID used to sign the credential.</li>
    </ul>

    <div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>If anything at all changes in the credential, even adding 
    a blank space, the credential is no longer valid because the content no longer matches the content that was used to create 
    the specific cryptographic signature for the specific credential.
    </div>
    <div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>If the signature is invalid, we cannot trust anything
    in the credential - not the name of the credential, the date, the issuer - absolutely nothing. If the signature is invalid 
    you might ask the holder if they had changed anything in it, and if so, to instead give you the credential as it was 
    when the issuer gave them their copy. 
    </div>
    <div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>If we can't retrieve the DID document for the DID that signed the 
    credential, or the public signing key that was used to sign the credential is not in the DID document, then signature verification fails
    because we can't know that the public key was ever 'registered' to that DID. This isn't an issue when using the did:key DID method 
    which doesn't require a separate DID document,
    but is required for did:web and did:webvh methods or any method that stores the DID document remotely.
    </div>
    <div  className={styles.criteria}><div className={styles.criteriaTitle}>How we determine the validity of the signature.</div> 
      <ul className={styles.list}>
      <li>The credential must not have been tampered with.</li>
      <li>We must be able to retrieve the DID document for the DID used to sign the credential, and that DID document must include the public key used to sign the credential.</li>
    </ul>
    </div>

    
  </>
}