import styles from '../Help.module.css';
import { VcDisplay } from '@/components/VcDisplay/VcDisplay';

const ExampleV2Section = () => {
  return <VcDisplay link='https://digitalcredentials.github.io/vc-test-fixtures/verifiableCredentials/v2/dataIntegrityProof/didKey/legacyRegistry-noStatus-noExpiry-achievementTypeExample.json' nodesToExpand={['credentialSubject', 'credentialSubject.achievement', 'credentialSubject.achievement.achievementType']}/>
}

const DeterminationSection = () => {
  return (
    <div>
      <div className={styles.preference}>achievementType is a property of an Open Badges version 3 Verifiable Credential:</div>
      <ul className={styles.list}>
        <li>credential.credentialSubject.achievement.achievementType</li>
      </ul>
      <div className={styles.preference}>See the example section for a working example.</div>
    </div>)
}

const DetailsSection = () => {
  return (
    <ul className={styles.list}>
      <li>Examples include 'Award', 'Certification', 'DoctoralDegree'.</li>
      <li>A full list of pre-defined Open Badge achievement types is defined in the <a target="_blank" className={styles.externalLink} href="https://www.imsglobal.org/spec/ob/v3p0#context">Open Badges Specification</a>. </li>
      <li>New OBv3 achievement types can be added by extending the OBv3 context.</li>
      <li>If no achievementType is available, nothing is shown, nor the label.</li>
    </ul>
  )
}

const NotesSection = () => {
  return (
    <>  
<div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>The goal of the achievementType field is interoperability. 
    If different credential issuers use the same achievementType for similar credentials then hopefully consumers of the 
    credential can treat the credentials as equivalent to some degree. It might of course be less useful to treat
    two credentials with a very general achievementType like 'Award' as equivalent, but hopefully moreso for two credential of type 'DoctoralDegree'. Over time 
    we expect that issuers will converge on common definitions.
    </div>
    </>
  )
}

const DescriptionSection = () => {
  return (
    <div className={styles.note}>The type of Open Badge achievement attested to by the credential.</div>
  )
}

export const achievementTypeHelpDescription = DescriptionSection()

export const achievementTypeHelpSections  = [
  { sectionTitle: 'Details', content: DetailsSection() },
  { sectionTitle: 'How We Determine the AchievementType', content: DeterminationSection() },
  { sectionTitle: 'Example - Open Badge version 3', content: ExampleV2Section() },
  { sectionTitle: 'Notes', content: NotesSection( )}
]


