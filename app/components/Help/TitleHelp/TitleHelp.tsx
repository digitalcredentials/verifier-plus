import styles from '../Help.module.css';
import { VcDisplay } from '@/components/VcDisplay/VcDisplay';

const ExampleV2Section = () => {
  return <VcDisplay link='https://digitalcredentials.github.io/vc-test-fixtures/verifiableCredentials/v2/ed25519/didKey/legacy-noStatus-expired.json' nodesToExpand={['validUntil']}/>
}

const ExampleOBv3Section = () => {
return <VcDisplay link='https://digitalcredentials.github.io/vc-test-fixtures/verifiableCredentials/v1/ed25519/didKey/legacy-noStatus-expired.json' nodesToExpand={['expirationDate']}/>
   
}
const ImageDeterminationSection = () => {
  return (
    <div>
      <div className={styles.preference}>For an Open Badge version 3:</div>
      <ul className={styles.list}>
        <li><span className={styles.emphasis}>credential.credentialSubject.achievement.image.id</span></li>
      </ul>
      <div className={styles.preference}>For a plain Verifiable Credential:</div>
      <ul className={styles.list}>
        <li><span className={styles.emphasis}>No value is used</span></li>
      </ul>
      <div className={styles.preference}>If a plain VC or no value is available for the OBv3 then we show nothing.</div>
      <div className={styles.preference}>See the example sections for working examples of each.</div>
    </div>)
}

const NameDeterminationSection = () => {
  return (
    <div>
      <div className={styles.preference}>For an Open Badge version 3:</div>
      <ul className={styles.list}>
        <li><span className={styles.emphasis}>credential.credentialSubject.achievement.name</span></li>
      </ul>
      <div className={styles.preference}>For a plain Verifiable Credential:</div>
      <ul className={styles.list}>
        <li><span className={styles.emphasis}>credential.credentialSubject.hasCredential.name</span></li>
      </ul>
       <div className={styles.preference}>If no value is available then we show nothing.</div>
      <div className={styles.preference}>See the example sections for working examples of each.</div>
    </div>)
}

const DetailsSection = () => {
  return (
    <div>
      <div className={styles.subtitle}>Credential Name</div>
      <ul className={styles.list}>
      <li>The name of the credential, or in other words, the name of the achievement declared by the credential.</li>
    </ul>
    <div className={styles.subtitle}>Credential Image</div>
    <ul className={styles.list}>
      <li>An image for the credential, sometimes called a badge image.</li>
      <li>The image value can be a url or the raw base64 encoded data for the image.</li>
    </ul>
  </div>
  )
}

const NameNotesSection = () => {
  return (
    <>  
<div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"/>Some issuers might make the name 
    unique to the holder. So where a a generic name might be Bachelor of Arts, some issuers might set the name as 
    Charlie Jones' Bachelor of Arts.
    </div>
    </>
  )
}


const ImageNotesSection = () => {
  return (
    <>  
<div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"/>In VerifierPlus we size the 
    image to 36px by 36px regardless of the actual size of the image.
    </div>
    <div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"/> Generally the same image is used for all instances of the credential, so not unique to the recipient, but they can be unique. It's up to the issuer.
    </div>
     <div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"/> A base64 encoded image contains the entire image, which is usually large, and so makes the credential itself very large. A url, on the other hand, points at the image, and doesn't affect the size of the credential.
    </div>
     <div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"/>The image returned from a URL can be changed after issuance. A base64 encoded image can't. </div>
    <div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"/>If the url for the image stops working, the image can't be displayed. A base64 image will always continue to work.</div>

    </>
  )
}

const DescriptionSection = () => {
  return (
    <div className={styles.note}>The name and image for the credential.</div>
  )
}

export const titleHelpDescription = DescriptionSection()

export const titleHelpSections  = [
  { sectionTitle: 'Details', content: DetailsSection() },
  { sectionTitle: 'How We Determine the Name', content: NameDeterminationSection() },
   { sectionTitle: 'How We Determine the Image', content: ImageDeterminationSection() },
  { sectionTitle: 'Example - Open Badge verison 3', content: ExampleOBv3Section() },
  { sectionTitle: 'Example - plain Verifiable Credential', content: ExampleV2Section() },
  { sectionTitle: 'Image Notes', content: ImageNotesSection( )},
  { sectionTitle: 'Name Notes', content: NameNotesSection( )}
]
