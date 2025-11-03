import styles from '../Help.module.css';
export const CriteriaHelp = () => {
 return <>
    <ul className={styles.list}>
      <li>A human readable description of the criteria that must be satisfied to earn the credential.</li>
      <li>Not required by Verifiable Credential data model.</li><li>Required by the OpenBadges version 3 data model.</li>
      <li>If no criteria is provided, nothing is shown, including the 'Criteria' title.</li>
    </ul>
    <p className={styles.note}><img src="./icons/info_24_lime.svg"></img>Note that the criteria field supports 
    Markdown syntax.
    </p>
    <p className={styles.criteria}><h1 className={styles.title}>How we determine the value of this field</h1>

      <ul className={styles.list}>
      <li>credential.credentialSubject.achievement.criteria (OBv3)</li>
    </ul>
    </p>

    
  </>
}