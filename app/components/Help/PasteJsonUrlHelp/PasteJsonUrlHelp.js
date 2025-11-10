import styles from '../Help.module.css';
export const PasteJsonUrlHelp = () => {
  return <>
  <ul className={styles.list}>
        <li>This is where you provide the Verifiable Credential you'd like to verify.</li>
        <li>You can either paste in the credential itself, which is a text file containing the credential encoded as JSON, or provide a URL that links to the file.</li>    
         <li>JSON (Javascript Object Notation) is a simple way to structure data in a parent/child hierachy.</li>  
          <li>You can alternatively upload the file directly from your computer using the text area just below labelled 'Drag and drop a file here or browse'.</li>   
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
      </div> You can also copy that URL and paste it into the text area. VerifierPlus will fetch the json from the URL and run verification.</div>

  </>
}