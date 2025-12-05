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
            <li>You can either choose the file from your computer by clicking 'browse', or find the file on your computer and drag it into the dotted box.</li>
            <li>The file must contain a Verifiable Credential.</li>
            <li>Verifiable Credentials are encoded as JSON and the file extension is typically '.json'.</li>
            <li>Examples of Verifiable Credentials are provided below in the examples sections.</li>
            <li>You can alternatively paste the JSON (or a link to the JSON) in the text area above labelled 'Paste JSON or URL'.</li>
        </ul>
    )
}

const NotesSection = () => {
    return (
        <>
        <div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>VerifierPlus only verifies <a target="_blank" className={styles.externalLink} href="https://w3c.github.io/vc-data-model/">Verifiable Credentials</a>, which
            includes Open Badges version 3, but not Open Badges version 2.
        </div>
        </>
    )
}

const DescriptionSection = () => {
    return (
        <div className={styles.note}>Drag in a Verifiable Credential file or click 'browse' to select the file.</div>
    )
}

export const dragAndDropHelpDescription = DescriptionSection()

export const dragAndDropHelpSections = [
    { sectionTitle: 'Details', content: DetailsSection() },
    { sectionTitle: 'Example - Verifiable Credential v1', content: ExampleV1Section() },
    { sectionTitle: 'Example - Verifiable Credential v2', content: ExampleV2Section() },
    { sectionTitle: 'Notes', content: NotesSection() }
]


