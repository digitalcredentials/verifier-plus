

import styles from '../Help.module.css';

const DetailsSection = () => {
  return (
    <ul className={styles.list}>
      <li>Request credentials from any web wallet that supports the <a className={styles.externalLink} href="https://vcplayground.org/docs/#credential-handler-api-chapi">Credential Handler API (CHAPI)</a></li>
      <li>The web wallet must have been registered with the browser beforehand.</li>
      <li>Your web wallet will provide instructions on registering with the browser.</li>
      <li>This feature is largely here as an example and for experimentation</li>
      <li>You typically aren't going to use the feature unless you are here specifically to experiement with this CHAPI implementation.</li>
    </ul>)
}

const NotesSection = () => {
  return (
    <>
      <div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>
        <a className={styles.externalLink} href="https://vcplayground.org/docs/#credential-handler-api-chapi">
        Credential Handler API (CHAPI)</a> is an API that allows the end user to select whatever wallet they'd like to use,
        rather than dictating that they must use a specific wallet, as typically happens when deeplinking to a
        wallet.
      </div>
      <div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>
        You can see an example of deeplinking to a specific wallet (the LCW) with the 'Request Credentials from LCW' button on this page.
      </div>
      <div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>
        An alternative to both deeplinking and CHAPI is the  <a className={styles.externalLink} href="https://digitalcredentials.dev">Digital Credentials API</a> for which we don't yet
        have an example.
      </div>
    </>
  )
}




const DescriptionSection = () => {
  return (
    <div className={styles.note}>Requests credentials from a wallet using the <a className={styles.externalLink} href="https://vcplayground.org/docs/#credential-handler-api-chapi">Credential Handler API (CHAPI)</a>.</div>
  )
}

export const chapiHelpDescription = DescriptionSection()

export const chapiHelpSections = [
  { sectionTitle: 'Details', content: DetailsSection() },
  { sectionTitle: 'Notes', content: NotesSection() }
]





