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
        <li><span style={{fontWeight:700}}>issuanceDate (required)</span></li>
      </ul>
      <div className={styles.preference}>For Version 2 of the VC data model, in order of preference:</div>
      <ul className={styles.list}>
        <li><span style={{fontWeight:700}}>validFrom (optional)</span></li>
        <li><span style={{fontWeight:700}}>proof.created (required)</span></li>
      </ul>
      <div className={styles.preference}>See the example sections for working examples of each.</div>
    </div>)
}

const DetailsSection = () => {
  return (
    <ul className={styles.list}>
      <li>The 'valid from' date is set directly in the Verifiable Credential and cannot be changed without invalidating the cryptographic signature.</li>
      <li>validFrom is the date at which the attestation of the Verifiable Credential became valid.</li>
      <li>This can be different from when the underlying credential (e.g., a degree) was issued.</li>
     <li>The dates of the underlying credential are better described with other domain specific properties.</li>
     <li>With OpenBadges v3, for example, awardedDate can recorded the date a degree was awarded.</li>
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
   
    
<div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>The 'valid From' date is not 
        necessarily the date when the underlying credential became valid, but rather the date the attestation of the VC itself became valid. 
        So, for example, a degree might have been issued to a graduate in 1994, but the VC attesting to the degree, might only have become
        valid in 2025. 
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
