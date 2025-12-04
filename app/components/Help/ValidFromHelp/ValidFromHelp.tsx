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
      <div className={styles.preference}>For Version 1 of the VC data model:</div>
      <ul className={styles.list}>
        <li><span className={styles.emphasis}>issuanceDate (required)</span></li>
      </ul>
      <div className={styles.preference}>For Version 2 of the VC data model, in order of preference:</div>
      <ul className={styles.list}>
        <li><span className={styles.emphasis}>validFrom (optional)</span></li>
        <li><span className={styles.emphasis}>proof.created (required)</span></li>
      </ul>
      <div className={styles.preference}>See the example sections for working examples of each.</div>
    </div>)
}

const DetailsSection = () => {
  return (
    <ul className={styles.list}>
       <li>The date at which the <span className={styles.emphasis}>attestation</span> of the Verifiable Credential became valid.</li>
      <li>The date is set directly in the Verifiable Credential and cannot be changed without invalidating the cryptographic signature.</li>
     <li>The underlying credential (e.g., a degree) may have a different issued/awarded date.</li>
     <li>OpenBadges v3 records the date a degree was awarded using awardedDate.</li>
     
    </ul>
  )
}

const NotesSection = () => {
  return (
    <>  
<div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>The Valid From date is not 
        necessarily the date when the underlying credential became valid, but rather the date the attestation of the VC itself became valid. 
        So, for example, a degree might have been issued to a graduate in 1994, but a VC attesting to the degree, might only have become
        valid in 2025. In other words the attestation and the thing being attested to (the claim) are two different
        things.
    </div>
    </>
  )
}

const DescriptionSection = () => {
  return (
    <div className={styles.note}>The date from which the Verifiable Credential is considered valid.</div>
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
