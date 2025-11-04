import styles from '../Help.module.css';
export const TitleHelp = () => {
 return <>
  <div className={styles.subtitle}>Credential Name</div>
    <ul className={styles.list}>
      <li>The name of the credential, or in other words, the name of the achievement declared by the credential.</li>
      <li>Generally the same name is used for all instances of the credential, so not unique to the recipient.</li>
    </ul>
    <p className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>Some issuers might make the name 
    unique to the holder. So where a a generic name might be Bachelor of Arts, some issuers might set the name as 
    Charlie Jones' Bachelor of Arts.
    </p>
    <p className={styles.criteria}><h1 className={styles.criteriaTitle}>How we determine the value of the name</h1>
    <div className={styles.preference}>In order of preference:</div>
      <ul className={styles.list}>
        <li>credential.credentialSubject.achievement.name (OBv3)</li>
        <li>credential.credentialSubject.hasCredential.name</li>
      </ul>
    </p>

<hr style={{margin: '20px 25px 10px 25px'}}/>
<div className={styles.subtitle}>Credential Image</div>
    <ul className={styles.list}>
      <li>An image for the credential, sometimes called a badge image.</li>
      <li>Generally the same image is used for all instances of the credential, so not unique to the recipient.</li>
    </ul>
    <p className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>Note that in VerifierPlus we size the 
    image to 36px by 36px regardless of the actual size of the image.
    </p>
    <p className={styles.criteria}><h1 className={styles.criteriaTitle}>How we determine the image to show</h1>
      <ul className={styles.list}>
        <li>credential.credentialSubject.achievement.image.id (OBv3)</li>
      </ul>
    </p>
  </>
}