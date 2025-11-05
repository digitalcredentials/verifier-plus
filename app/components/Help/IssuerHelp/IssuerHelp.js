import styles from '../Help.module.css';

export const IssuerHelp = () => {
  return <>
   <ul className={styles.list}>
        <li>Typically whoever signed the Verifiable Credential, for example, a university that issues students Verifiable Credentials confirming their degree.</li>
        <li>The issuer is described in the <b>issuer</b> property of the Verifiable Credential.</li>
        <li>The issuer may also be described in an <b>'issuer registry'</b> completely separate from the credential.</li>
        <li>The LCW and VerifierPlus use issuer details from our registry in preference to the details in the VC.</li>
        <li>An issuer's DID <b>MUST</b> be listed in a trusted registry in order for VCs issued with that DID to be trusted.</li>
      </ul>
      <div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>
      Fundmentally important is that to trust anything signed by an issuer,
      the DID (Decentralized Identififer) used to
      sign the credential must be known to us in some way. That might be because
      we keep a list of DIDs in our verifier that we know about (an internal registry), or it might that we look up
      the DID in some kind of shared registry that we in turn trust. Both are effectively lists
      of DIDs that we trust. If a credential has not been signed by a DID that we know about
      then we cannot trust the credential - it could have been faked and signed by anyone.
      </div>
  </>
}