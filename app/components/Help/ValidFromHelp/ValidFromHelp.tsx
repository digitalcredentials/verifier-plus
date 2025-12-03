import styles from '../Help.module.css';
import { VcDisplay } from '@/components/VcDisplay/VcDisplay';

const ExampleV2Section = () => {
  return <VcDisplay link='https://digitalcredentials.github.io/vc-test-fixtures/verifiableCredentials/v2/ed25519/didKey/legacy-noStatus-expired.json' nodesToExpand={['validUntil']}/>
}

const ExampleV1Section = () => {
return <VcDisplay link='https://digitalcredentials.github.io/vc-test-fixtures/verifiableCredentials/v1/ed25519/didKey/legacy-noStatus-expired.json' nodesToExpand={['expirationDate']}/>
   
}
const DeterminationSection = () => {
  return (
    <div>
      <div className={styles.preference}>According to the version of the Verifiable Credentials data model:</div>
      <ul className={styles.list}>
        <li>Version 1: <span style={{fontWeight:700}}>issuanceDate</span></li>
        <li>Version 2: <span style={{fontWeight:700}}>validFrom</span></li>
      </ul>
      <div className={styles.preference}>See the example sections for working examples of each.</div>
    </div>)
}

const DetailsSection = () => {
  return (
    <ul className={styles.list}>
      <li>The issuance date is set directly in the Verifiable Credential and cannot be changed without invalidating the cryptographic signature.</li>
      <li>issuanceDate (version 1) is required.</li>
      <li>validFrom (version 2) is not required.</li>
<li>If there is no validFrom then 
    the Verifiable Credential is considered valid as of the moment it was created.</li>
    </ul>
  )
}

const NotesSection = () => {
  return (
    <>
    <div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>The issuance date is not necessarily
    the date that the Verifiable Credential was signed, although in most cases they will be the same. The issuance date can in 
    fact pre-date the VC or be in a date after the VC was signed. So it might be better to think of the issuance date as 
    the date at which the Verifiable Credential becomes valid, which could have been in the past or future.
    </div>
    <div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>
    </div>
<div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>Note that the issuance date is not 
        the date when the underlying credential (like a degree) was awarded. In that case, when using OBv3, the better 
        field to use is awardedDate.
    </div>
    </>
  )
}

const DescriptionSection = () => {
  return (
    <div className={styles.note}>The date from which the credential is considered valid.</div>
  )
}

export const validFromHelpDescription = DescriptionSection()

export const validFromHelpSections  = [
  { sectionTitle: 'Details', content: DetailsSection() },
  { sectionTitle: 'How We Determine the Valid From Date', content: DeterminationSection() },
  { sectionTitle: 'Example - Verifiable Credential v1', content: ExampleV1Section() },
  { sectionTitle: 'Example - Verifiable Credential v2', content: ExampleV2Section() },
  { sectionTitle: 'Notes', content: NotesSection( )}
]
