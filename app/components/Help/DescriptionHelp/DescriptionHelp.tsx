import styles from '../Help.module.css';
export const DescriptionHelp = () => {
 return <>
    <ul className={styles.list}>
      <li>A short human readable description of the credential<br/>e.g, 'Bachelor of Science in Computer Science'.</li>
      <li>Not required by Verifiable Credential data model.</li><li>Required by the OpenBadges version 3 data model.</li>
      <li>If no description is provided, nothing is shown, including the 'Description' title.</li>
    </ul>

    <p className={styles.note}><img src="./icons/info_24_lime.svg"></img>Note that formatting is not accommodated in the 
    description field. To provide a more stylized presentation, consider using the 'Criteria' field, which does allow 
    Markdown syntax.
    </p>
    <p><h1 className={styles.title}>How we determine the value of this field</h1>
    In order of preference:
      <ul className={styles.list}>
      <li>credential.credentialSubject.achievement.description (OBv3)</li>
      <li>credential.credentialSubject.hasCredential.description</li>
    </ul>
    </p>

    
  </>
}