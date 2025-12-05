import styles from '../Help.module.css';

const DetailsSection = () => {
  return (
    <ul className={styles.list}>
      <li>Using your phone or computer camera you can scan a QR that either:
          <ul className={styles.list}>
            <li>links to a Verifiable Credential</li>
            <li>links to a Verifiable Presentation that wraps a Verifiable Credential</li>
            <li>encodes a Verifiable Presentation (containing a Verifiable Credential) directly into the QR as CBOR-LD</li>
          </ul> </li>
        <li>If a link, VerifierPlus fetches the Verifiable Credential and/or extract it from the Verifiable Presentation.</li>
        <li>If a CBOR-LD encoded VP, VerifierPlus extracts the Verifiable Credential.</li>
        <li>VerifierPlus verifies whatever Verifiable Credential is returned or extracted.</li>
      </ul> )
}

const ExampleSection = () => {
  return (
        <div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>
      Here is a sample QR you can scan to see how it works. Note that you'll need two devices to 
      do this, or will have to print the QR before scanning.
    <div >
      <img className={styles.qrCode} src="./helpImages/legacyRegistry-noStatus-noExpiry-basicOBv3.png"/>
      </div>
        </div>
  )
}

const DescriptionSection = () => {
  return (
    <div className={styles.note}>Scans a QR code pointing to, or containing, a Verifiable Credential, and verifies it.</div>
  )
}

export const scanQRHelpDescription = DescriptionSection()

export const scanQRtHelpSections  = [
  { sectionTitle: 'Details', content: DetailsSection() },
  { sectionTitle: 'Example', content: ExampleSection() }
]





