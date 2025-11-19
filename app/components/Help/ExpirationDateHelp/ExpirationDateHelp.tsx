import { VcDisplay } from '@/components/VcDisplay/VcDisplay';
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

const ExampleV2Section = () => {
  return <VcDisplay link='https://digitalcredentials.github.io/vc-test-fixtures/verifiableCredentials/v2/ed25519/didKey/legacy-noStatus-expired.json'/>
}

const ExampleV1Section = () => {
return <VcDisplay link='https://digitalcredentials.github.io/vc-test-fixtures/verifiableCredentials/v1/ed25519/didKey/legacy-noStatus-expired.json'/>
   
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