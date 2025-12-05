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
            <li>You can either paste in the credential itself, which is a text file containing the credential encoded as JSON, or provide a URL that links to the file.</li>
            <li>JSON (Javascript Object Notation) is a simple way to structure data in a parent/child hierachy.</li>
            <li>Examples of Verifiable Credentials are provided below in the examples sections.</li>
            <li>You can alternatively upload the file directly from your computer using the text area just below labelled 'Drag and drop a file here or browse'.</li>
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
        <div className={styles.note}>Paste in your Verifiable Credential or a link to it.</div>
    )
}

export const pasteJSONHelpDescription = DescriptionSection()

export const pasteJSONHelpSections = [
    { sectionTitle: 'Details', content: DetailsSection() },
    { sectionTitle: 'Example - Verifiable Credential v1', content: ExampleV1Section() },
    { sectionTitle: 'Example - Verifiable Credential v2', content: ExampleV2Section() },
    { sectionTitle: 'Notes', content: NotesSection() }
]




