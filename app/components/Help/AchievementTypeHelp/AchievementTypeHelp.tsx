import styles from '../Help.module.css';
export const AchievementTypeHelp = () => {
 return <>
    <ul className={styles.list}>
      <li>The type of Open Badge achievement attested to by the credential, for example 'Award', 'Certification', 'DoctoralDegree'.</li>
      <li>A full list of pre-defined Open Badge achievement types is defined in the <a href="https://www.imsglobal.org/spec/ob/v3p0#context">Open Badges Specification</a>. </li>
      <li>New OBv3 achievement types can be added by extending the OBv3 context.</li>
      <li>If no achievementType is available, nothing is shown including the label.</li>
    </ul>
    <p className={styles.note}><img src="./icons/info_24_lime.svg"></img>Note that the goal of the achievementType field is interoperability. 
    If different credential issuers use the same achievementType for similar credentials then hopefully consumers of the 
    credential can treat the credentials as equivalent to some degree. It might of course be less useful to treat
    two credentials with an achievementType of 'award' as equivalent, but hopefully moreso for two credential of type 'DoctoralDegree'. Over time 
    we expect that issuers will converge on common definitions.
    </p>
    <p className={styles.criteria}><h1 className={styles.title}>How we determine the value of this field</h1>
    <div className={styles.preference}>In order of preference:</div>
      <ul className={styles.list}>
        <li>credential.credentialSubject.achievement.achievementType (OBv3)</li>
      </ul>
    </p>

    
  </>
}