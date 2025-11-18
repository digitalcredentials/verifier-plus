import styles from '../Help.module.css';
export const ExpirationDateHelp = () => {
  return <>
    <DetailsSection />
    <DeterminationSection />
    <ExampleV1Section />
    <ExampleV2Section />
    <NotesSection />
  </>
}

const ExampleV1Section = () => {
  return (
    <div>
      <div>This is a working example that you can copy and paste into VerifierPlus.</div>

      <pre>
        {`   {
    "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.2.json",
        "https://w3id.org/security/suites/ed25519-2020/v1"
    ],
    "id": "urn:uuid:2fe53dc9-b2ec-4939-9b2c-0d00f6663b6c",
    "issuanceDate": "2025-01-09T15:06:31Z",
    "expirationDate": "2025-01-09T16:23:24Z",
    "type": [
        "VerifiableCredential",
        "OpenBadgeCredential"
    ],
    "name": "DCC Test Credential",
    "issuer": {
        "type": [
            "Profile"
        ],
        "id": "did:key:z6MknNQD1WHLGGraFi6zcbGevuAgkVfdyCdtZnQTGWVVvR5Q",
        "name": "Digital Credentials Consortium Test Issuer",
        "url": "https://dcconsortium.org",
        "image": "https://user-images.githubusercontent.com/752326/230469660-8f80d264-eccf-4edd-8e50-ea634d407778.png"
    },
    "credentialSubject": {
        "type": [
            "AchievementSubject"
        ],
        "achievement": {
            "id": "urn:uuid:bd6d9316-f7ae-4073-a1e5-2f7f5bd22922",
            "type": [
                "Achievement"
            ],
            "achievementType": "Diploma",
            "name": "Badge",
            "description": "This is a sample credential issued by the Digital Credentials Consortium to demonstrate the functionality of Verifiable Credentials for wallets and verifiers.",
            "criteria": {
                "type": "Criteria",
                "narrative": "This credential was issued to a student that demonstrated proficiency in the Python programming language that occurred from **February 17, 2023** to **June 12, 2023**."
            },
            "image": {
                "id": "https://user-images.githubusercontent.com/752326/214947713-15826a3a-b5ac-4fba-8d4a-884b60cb7157.png",
                "type": "Image"
            }
        },
        "name": "Jane Doe"
    },
    "proof": {
        "type": "Ed25519Signature2020",
        "created": "2025-01-09T17:56:21Z",
        "verificationMethod": "did:key:z6MknNQD1WHLGGraFi6zcbGevuAgkVfdyCdtZnQTGWVVvR5Q#z6MknNQD1WHLGGraFi6zcbGevuAgkVfdyCdtZnQTGWVVvR5Q",
        "proofPurpose": "assertionMethod",
        "proofValue": "z44bwcZ2bQftiyUGKY6L7Gmg7iYfi9k6Va15osdm3KaKVnSW2DscpAMJVSs4UBf9riYReQ8VbZRf2qCY8W1rq2k3z"
    }
}`}
</pre>
</div>
)}

const ExampleV2Section = () => {
return (
    <div>
      <div>This is a working example that you can copy and paste into VerifierPlus.</div>

    
     <pre>{`   {
    "@context": [
        "https://www.w3.org/ns/credentials/v2",
        "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json",
        "https://w3id.org/security/suites/ed25519-2020/v1"
    ],
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
    "validFrom": "2010-01-01T00:00:00Z",
    "validUntil": "2011-01-01T00:00:00Z",
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
        "type": "Ed25519Signature2020",
        "created": "2025-01-07T22:14:25Z",
        "verificationMethod": "did:key:z6MknNQD1WHLGGraFi6zcbGevuAgkVfdyCdtZnQTGWVVvR5Q#z6MknNQD1WHLGGraFi6zcbGevuAgkVfdyCdtZnQTGWVVvR5Q",
        "proofPurpose": "assertionMethod",
        "proofValue": "z2B4R2hwrcgR8ag39SZEgm2hAJSPnoWae7zdRr8RUTkcbMPNHu7tedk1x3D29J3CmiU5Wb1e7zew82nQAKYCQuRBo"
    }
}`}</pre>
      <div></div>
    </div>
  )
}
const DeterminationSection = () => {
  return (
    <div className={styles.criteria}><div className={styles.title}>How we determine the expiration date</div>
      <div className={styles.preference}>According to the version of the Verifiable Credentials data model:</div>
      <ul className={styles.list}>
        <li>Version 1: expirationDate</li>
        <li>Version 2: validUntil</li>
      </ul>
      <div className={styles.preference}>See the example sections for working examples.</div>
    </div>)
}

const DetailsSection = () => {
  return (
    <ul className={styles.list}>
      <li>The expiry date is set directly in the Verifiable Credential and cannot be changed without invalidating the cryptographic signature.</li>
      <li>The expiry date is not required. A credential can be issued that never expires.</li>
    </ul>
  )
}

const NotesSection = () => {
  return (
    <div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>Sometimes a credential is still useful even though it has expired. An expired driver's licence, for
      example, can still be used to prove our age. Or to prove that we were authorized to drive during a given period,
      which might be useful when applying for car insurance.
    </div>
  )
}

const ExpirationDateDescriptionSection = () => {
  return (
    <div className={styles.note}> The date until which the credential is considered valid.</div>
  )
}

export const expirationDateHelpDescription = ExpirationDateDescriptionSection()

export const expirationDateHelpSections  = [
  { sectionTitle: 'Details', content: DetailsSection() },
  { sectionTitle: 'How We Determine the Expiration Date', content: DeterminationSection() },
  { sectionTitle: 'Verifiable Credential Version 1 Example', content: ExampleV1Section() },
  { sectionTitle: 'Verifiable Credential Version 2 Example', content: ExampleV2Section() },
  { sectionTitle: 'Notes', content: NotesSection( )}
]