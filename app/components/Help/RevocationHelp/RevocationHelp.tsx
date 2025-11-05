import styles from '../Help.module.css';
export const RevocationHelp = () => {
 return <>
    <ul className={styles.list}>
      <li>A revoked credential is considered entirely invalid.</li>
      <li>Optional - not required by Verifiable Credential data model or the OBv3 data model.</li>
      <li>Applies only to the VC, not to the underlying credential.</li>
      <li>The DCC uses the BitstringStatusList implementation.</li>
    </ul>

    <p className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>A very 
    important point here is that the credentialStatus field revokes the 
    Verifiable Credential, and NOT the underlying credential. So the VC issued for a degree might be 
    revoked, but that does not imply the degree itself was revoked. It might be that the degree was 
    in fact revoked, but the credentialStatus only applies to the VC.
    </p>

        <p className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>Other approaches 
        are possible - a simple list of credential ids for example -
        but the BitstringStatusList has a good mix of pretty-good-privacy, simplicity, and size for most needs.<br/><br/>
A bitstring 
        is simply a list of zeros and ones like so: 010000100. For that list, the credential that has been assigned the 
        second position and third last positions in the list have been revoked. If credentials have 
        been assigned the other positions they have not been revoked. <br/><br/>
 When a verifier is checking a given credential they ask the issuer for the entire bistring (
          which ideally is very long, so thousands of bits providing status for thousands of VCs), but without telling the 
          issuer which specific credential they are checking. This is often called 'herd-privacy'.
    </p>

    <p  className={styles.criteria}><h1 className={styles.title}>How we determine if a credential has been revoked</h1>
        <div className={styles.preference}>For a VC with a 'credentialStatus' entry like the following: </div>
        <pre>{`"credentialStatus": {
        "id": "https://example.com/list/e5Wmbrj#7",
        "type": "BitstringStatusListEntry",
        "statusPurpose": "revocation",
        "statusListCredential": "https://example.com/list/e5Wmbrj",
        "statusListIndex": "7"
    }`}</pre>
      We retrieve the status list from the statusListCredential url and then check that the bit at the position indicated by 'statusListIndex' is 
      '0', that is that it hasn't been 'flipped' to a '1' to indicate revocation.
    </p>
  </>
}