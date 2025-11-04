import styles from '../Help.module.css';
export const TitleHelp = () => {
 return <>
    <ul className={styles.list}>
      <li>The name of the credential, or in other words, the name of the achievement attested by the credential.</li>
      <li>Generally the same name for all instances of the credential, so not unique to the recipient.</li>
    </ul>
    <p className={styles.note}><img src="./icons/info_24_lime.svg"></img>Note that some issuers might make the name 
    unique to the holder. So where a a generic name might be Bachelor of Arts, some issuers might set the name as 
    Charlie Jones' Bachelor of Arts.
    </p>
    <p className={styles.criteria}><h1 className={styles.title}>How we determine the value of this field</h1>
    <div className={styles.preference}>In order of preference:</div>
      <ul className={styles.list}>
        <li>credential.credentialSubject.achievement.name (OBv3)</li>
        <li>credential.credentialSubject.hasCredential.name</li>
      </ul>
    </p>

    
  </>
}