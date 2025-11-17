import styles from '../Help.module.css';
export const ExpirationDateHelp = () => {
  return <>
    <DetailsSection />
    <DeterminationSection />
    <ExampleSection />
    <NotesSection />
  </>
}

const ExampleSection = () => {
  return (
    <ul>
      <li>Version 1 Verifiable Credentials set the date like so: <b>"expirationDate": "2025-01-09T16:23:24Z"</b></li>
      <li>Version 2 Verifiable Credentials set the date like so: <b>"validUntil": "2025-01-09T16:23:24Z"</b></li>
    </ul>
  )
}
const DeterminationSection = () => {
  return (
    <div className={styles.criteria}><div className={styles.title}>How we determine the expiration date</div>
      <div className={styles.preference}>According to the version of Verifiable Credentials data model:</div>
      <ul className={styles.list}>
        <li>credential.expirationDate (v1)</li>
        <li>credential.validUntil (v2)</li>
      </ul>
    </div>)
}

const DetailsSection = () => {
  return (
    <ul className={styles.list}>
      <li>The expiry date is set directly in the Verifiable Credential and cannot be changed without invalidating the cryptographic signature.</li>
      <li>The expiry date is not required. A credential can be issued that never expires.</li>
      <li>A credential is considered 'expired' after the given date.</li>
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

export const DescriptionSection = () => {
  return (
    <div className={styles.note}> The date until which the credential is considered valid.</div>
  )
}

export const expirationDateHelpSections  = [
  { sectionTitle: 'Details', content: DetailsSection() },
  { sectionTitle: 'Example', content: ExampleSection() },
  { sectionTitle: 'How We Determine the Expiration Date Date', content: DeterminationSection() },
  { sectionTitle: 'Notes', content: NotesSection( )}
]