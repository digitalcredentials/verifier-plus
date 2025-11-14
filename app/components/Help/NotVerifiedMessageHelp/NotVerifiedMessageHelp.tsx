import styles from '../Help.module.css';
export const NotVerifiedMessageHelp = () => {
 return <>
    <ul className={styles.list}>
      <li>One or more of the checks during verification failed, and were severe enough that we outright reject the credential.</li>
    </ul>
    <div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>
If a credential has been tampered with, that is to say some part of the content of the credential has been changed since the 
credential was signed, then we consider the entire credential invalid because we can't detect specifically what changed, only 
that something changed, which means <span style={{fontWeight: 600}}>anything</span> could have changed.<br/><br/>
The change may have been unintentional or because someone didn't realize that they couldn't, for example, correct a mis-spelling 
in their name, but for all we know, the entire name might have been changed, or the name of the credential may have been changed (e.g.,
changing a certificate of completion to a doctoral degree) - anything. So we are forced to declare the whole credential invalid.
    </div>
    <div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>
The cyrptographic keys used to sign Verifiable Credentials are typically encoded in something called a DID (Decentralized Identifier) that
makes it easier to associate different keys with the same identifier, thereby allowing for 'key rotation' and other kinds of key management.
A fundamental aspect of DIDs therefore is that the keys asssociated with that DID are listed in a 'DID Document' and often that DID document
must be retrieved from a URL. If, however, the DID document can't be retrieved, then we can't confirm that the specific key 
used to sign a credential does in fact belong to that DID. Which means the signing key could be fake. And so we must declare 
the credential unverifiable.
    </div>
    <div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>
A revoked credential is considered entirely invalid because it is possible that it never should 
have been issued in the first place, in other words it never should have been considered valid. An example might be a 
credential that was mistakenly issued to the wrong person.<br/><br/>
There are cases where a credential might be revoked even though it was valid at some point, like say if someone legally changes their name
and a new credential is subsequently issued, and the issuer doesn't want the old credential to be used any longer. The issuer could instead opt to leave the old credential valid because it does still in some sense describe 
a fact that was true at the time of issuance, but that is a policy decision the issuer must make.<br/><br/>Even if that old credential 
is revoked, it might still be useful to prove say that the holder had a different name at the time of issuance, but the verifying software
can't know that was why it was revoked. 
    </div>
     <div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>
You might reasonably ask why a reason isn't associated with a revocation. We don't associate a reason because that 
reason would have to be posted publicly (so it could be retrieved by the verifier) and we typically don't want to 
publicly discolose reasons for revocation, which could badly jeopardize the holder's privacy.
    </div>
    <div className={styles.criteria}><div className={styles.criteriaTitle}>What produces a warning</div>
      <ul className={styles.list}>
      <li>The credential has been revoked.</li>
      <li>The credential has been tampered with.</li>
      <li>We couldn't retrieve the DID document for the DID that signed the credential.</li>
    </ul>
    </div>
  </>
}