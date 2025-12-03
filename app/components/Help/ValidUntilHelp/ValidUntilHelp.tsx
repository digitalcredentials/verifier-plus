import { VcDisplay } from '@/components/VcDisplay/VcDisplay';
import styles from '../Help.module.css';

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
        <li>Version 1: <span style={{fontWeight:700}}>expirationDate</span></li>
        <li>Version 2: <span style={{fontWeight:700}}>validUntil</span></li>
      </ul>
      <div className={styles.preference}>See the example sections for working examples of each.</div>
    </div>)
}

const DetailsSection = () => {
  return (
    <ul className={styles.list}>
      <li>The validUntil date is set directly in the Verifiable Credential and cannot be changed without invalidating the cryptographic signature.</li>
      <li>The validUntil date is not required. A credential can be issued that never expires.</li>
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

const DescriptionSection = () => {
  return (
    <div className={styles.note}> The date until which the credential is considered valid.</div>
  )
}

export const validUntilHelpDescription = DescriptionSection()

export const validUntilHelpSections  = [
  { sectionTitle: 'Details', content: DetailsSection() },
  { sectionTitle: 'How We Determine the Valid Until Date', content: DeterminationSection() },
  { sectionTitle: 'Example - Verifiable Credential v1', content: ExampleV1Section() },
  { sectionTitle: 'Example - Verifiable Credential v2', content: ExampleV2Section() },
  { sectionTitle: 'Notes', content: NotesSection( )}
]