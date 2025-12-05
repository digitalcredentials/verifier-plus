import styles from '../Help.module.css';
import { VcDisplay } from '@/components/VcDisplay/VcDisplay';

const ExampleV2Section = () => {
    return <VcDisplay link='https://digitalcredentials.github.io/vc-test-fixtures/verifiableCredentials/v2/dataIntegrityProof/didKey/legacyRegistry-noStatus-noExpiry-basicOBv3.json' />
}

const ExampleV1Section = () => {
    return <VcDisplay link='https://digitalcredentials.github.io/vc-test-fixtures/verifiableCredentials/v1/ed25519/didKey/legacy-noStatus-expired.json' />

}

const DetailsSection = () => {
    return (
        <ul className={styles.list}>
        <li>You must provide a valid Verifiable Credential in JSON format (see the example sections below).</li>
         <li>If you've pasted anything other than the JSON for a Verifiable Credential or a URL (link) that returns a Verifiable Credential, you'll get this error.</li>   
        <li>If you've provided a URL, it might not return a Verifiable Credential, or might not be a valid URL.</li>
        <li>If you've not put anything at all into the text box, you'll also get this error.</li>  
        </ul>
    )
}

const NotesSection = () => {
    return (
        <>
        <div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>VerifierPlus only verifies <a target="_blank" className={styles.externalLink} href="https://w3c.github.io/vc-data-model/">Verifiable Credentials</a>, which
            includes Open Badges version 3, but not Open Badges version 2.
        </div>
         <div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>Be careful when copying and pasting your VC. If anything 
         changes in a VC after it is signed, including things like adding extra spaces, then it won't verify. Sometimes the copy/paste can
         change things like quotation marks or spacing.
        </div>
        </>
    )
}

const DescriptionSection = () => {
    return (
        <div className={styles.note}>Whatever you've provided as a Verifiable Credential wasn't understood by VerifierPlus.</div>
    )
}

export const notVCHelpDescription = DescriptionSection()

export const notVCHelpSections = [
    { sectionTitle: 'Details', content: DetailsSection() },
    { sectionTitle: 'Example - Verifiable Credential v1', content: ExampleV1Section() },
    { sectionTitle: 'Example - Verifiable Credential v2', content: ExampleV2Section() },
    { sectionTitle: 'Notes', content: NotesSection() }
]








         
  
       