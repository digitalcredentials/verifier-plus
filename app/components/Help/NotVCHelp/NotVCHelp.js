import styles from '../Help.module.css';
export const NotVCHelp = () => {
  return <>
  <ul className={styles.list}>
       <li>Whatever you've provided as a Verifiable Credential wasn't understood by VerifierPlus</li>
        <li>You must provide a valid Verifiable Credential in JSON format (see below for an example).</li>
         <li>If you've pasted anything other than the JSON for a Verifiable Credential or a URL (link) that returns a Verifiable Credential, you'll get this error.</li>   
        <li>If you've provided a URL, it may not return a Verifiable Credential, or may not be a valid URL.</li>
        <li>If you've not put anything at all into the text box, you'll also get this error.</li>      
 </ul>
         
  
     <div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>
      A simple example of a Verifiable Credential (and more specifically an Open Badge version 3 Verifiable Creential) that you can copy/paste into the text area if you like:

     <pre className={styles.scrollableCode}>{`{
    "@context": [
        "https://www.w3.org/ns/credentials/v2",
        "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json"
    ],
    "validFrom": "2025-01-09T15:06:31Z",
    "id": "http://example.com/credentials/3527",
    "type": [
        "VerifiableCredential",
        "OpenBadgeCredential"
    ],
    "issuer": {
        "id": "did:key:z6MknNQD1WHLGGraFi6zcbGevuAgkVfdyCdtZnQTGWVVvR5Q",
        "type": [
            "Profile"
        ],
        "name": "Example Corp"
    },
    "name": "Teamwork Badge",
    "credentialSubject": {
        "id": "did:example:ebfeb1f712ebc6f1c276e12ec21",
        "type": [
            "AchievementSubject"
        ],
        "achievement": {
            "id": "https://example.com/achievements/21st-century-skills/teamwork",
            "type": [
                "Achievement"
            ],
            "criteria": {
                "narrative": "Team members are nominated for this badge by their peers and recognized upon review by Example Corp management."
            },
            "description": "This badge recognizes the development of the capacity to collaborate within a group environment.",
            "name": "Teamwork"
        }
    },
    "proof": {
        "type": "DataIntegrityProof",
        "created": "2025-11-10T14:49:26Z",
        "verificationMethod": "did:key:z6MknNQD1WHLGGraFi6zcbGevuAgkVfdyCdtZnQTGWVVvR5Q#z6MknNQD1WHLGGraFi6zcbGevuAgkVfdyCdtZnQTGWVVvR5Q",
        "cryptosuite": "eddsa-rdfc-2022",
        "proofPurpose": "assertionMethod",
        "proofValue": "z3jqgQq2WpjsvHQp9XWxKcMvcehyTurrWawo33jvQk8CvbjQRvAgtsw9P2u2fXqY7iABSuBQdtt9UQyHsN82LRuq7"
    }
}`}</pre>

      A copy of that same Verifiable Credential is available at this URL:
      <div className={styles.scrollableLink}>
        <a href="https://digitalcredentials.github.io/vc-test-fixtures/verifiableCredentials/v2/dataIntegrityProof/didKey/legacyRegistry-noStatus-noExpiry-basicOBv3.json"><div className={styles.scrollableLink}>https://digitalcredentials.github.io/vc-test-fixtures/verifiableCredentials/v2/dataIntegrityProof/didKey/legacyRegistry-noStatus-noExpiry-basicOBv3.json</div></a>
      </div> 
      You can also copy that URL and paste it into the text area. VerifierPlus will fetch the json from the URL and run verification.
      <div style={{paddingTop:'1em'}}>
        Finally, you can directly open that credential in VerifierPlus by clicking: <a target="_blank" style={{color:"black"}} href="https://verifierplus.org#verify?vc=https://digitalcredentials.github.io/vc-test-fixtures/verifiableCredentials/v2/dataIntegrityProof/didKey/legacyRegistry-noStatus-noExpiry-basicOBv3.json">here.</a>
      </div>
      </div>

    
      
      </>
}