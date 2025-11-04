import styles from '../Help.module.css';
export const CredentialFormatHelp = () => {
 return <>
    <ul className={styles.list}>
      <li>Various checks to confirm we are in fact dealing with a well-formed Verifiable Credential</li>
      <li>These aren't checks on the validity of the signature or data, but rather simply that the data is in the format we expect.</li>
    </ul>

    <p className={styles.note}><img src="./icons/info_24_lime.svg"></img>We try to check for as many things as possible, but 
    of course there may be edge cases we haven't yet surfaced.
    </p>
    <p  className={styles.criteria}><h1 className={styles.title}>How we determine the validity</h1>
        <div className={styles.preference}>The credential must:</div>
      <ul className={styles.list}>
      <li>be valid JSON</li>
      <li>have a JSON-LD context</li>
    </ul>
    </p>

    
  </>
}