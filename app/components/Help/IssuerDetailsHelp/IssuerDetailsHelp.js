import styles from '../Help.module.css';
import { VcDisplay } from '@/components/VcDisplay/VcDisplay';

const ExampleNoImageSection = () => {
  return <VcDisplay link='https://digitalcredentials.github.io/vc-test-fixtures/verifiableCredentials/v2/ed25519/didKey/legacy-noStatus-expired.json' nodesToExpand={['issuer']}/>
}

const ExampleImageSection = () => {
  return <VcDisplay link='https://digitalcredentials.github.io/vc-test-fixtures/verifiableCredentials/v1/ed25519/didKey/legacy-noStatus-expired.json' nodesToExpand={['issuer', 'issuer.image']}/> 
}

const ExampleImageIdSection = () => {
  return <VcDisplay link='https://digitalcredentials.github.io/vc-test-fixtures/verifiableCredentials/v1/ed25519/didKey/legacyRegistry-noStatus-noExpiry-issuerImageId.json' nodesToExpand={['issuer', 'issuer.image', 'issuer.image.id']}/> 
}

const DeterminationSection = () => {
  return (
    <>
    <div className={styles.preference}>In order of preference:</div>
            <ul className={styles.list}>
            <li>If the issuer is listed in a registry, we pull the issuer name, logo, and url from the registry.</li>
            <li>If the issuer is listed in more than one registry we use the first registry in our ordered list of registries.</li>
            <li>If the issuer is not in a registry we use:</li>
              <ul>
                <li>Logo: <span className={styles.emphasis}>issuer.image.id</span> otherwise <span className={styles.emphasis}>issuer.image</span></li>
                <li>Name: <span className={styles.emphasis}>issuer.name</span></li>
                <li>URL: <span className={styles.emphasis}>issuer.url</span></li>
              </ul>
            <li>If no name, url, or image is provided in either a registry or in the VC itself then we show nothing for the missing values.</li>
          </ul>
    </>)
}

const DetailsSection = () => {
  return (
    <ul className={styles.list}>
       <li>Typically whoever signed the Verifiable Credential, for example, a university attesting to their degrees.</li>
        <li>The issuer is described in the <b>issuer</b> property of the Verifiable Credential.</li>
        <li>The issuer may also be described in an <b>'issuer registry'</b> that is completely separate from the credential.</li>
        <li>The DCC LCW and VerifierPlus use issuer details from the DCC registry in preference to the details in the VC.</li>
        <li>An issuer's DID <b>MUST</b> be listed in a trusted registry in order for VCs issued with that DID to be trusted.</li>
    </ul>
  )
}

const NotesSection = () => {
  return (
    <>  
      <div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>
      We always show issuer details from the registry (when available) rather than from the credential 
      itself as a safeguard against the possibility that someone used the signing key to issue
      credentials in which they've claimed to be a different issuer.
      </div>
    </>
  )
}

const DescriptionSection = () => {
  return (
    <div className={styles.note}>The issuer of the Verifiable Credential</div>
  )
}

export const issuerDetailsHelpDescription = DescriptionSection()

export const issuerDetailsHelpSections  = [
  { sectionTitle: 'Details', content: DetailsSection() },
  { sectionTitle: 'How We Determine the Valid From Date', content: DeterminationSection() },
   { sectionTitle: 'Example VC - issuer.image.id', content: ExampleImageIdSection() },
  { sectionTitle: 'Example VC - issuer.image', content: ExampleImageSection() },
  { sectionTitle: 'Example VC - No Issuer Image', content: ExampleNoImageSection() },
  { sectionTitle: 'Notes', content: NotesSection( )}
]


