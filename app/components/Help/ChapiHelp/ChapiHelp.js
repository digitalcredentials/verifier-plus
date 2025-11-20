import styles from '../Help.module.css';
export const ChapiHelp = () => {
  return <>
  <ul className={styles.list}>
        <li>Request credentials from any web wallet that supports the CHAPI protocol.</li>
        <li>The web wallet must have been registered with the browser beforehand.</li>
        <li>Your web wallet will provide instructions on registering with the browser.</li>
  </ul>
  
     <div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>
      CHAPI is a wallet selection protocol that allows the end user to select whatever wallet they'd like to use, 
      rather than dictating that they must use a specific wallet, as typically happens when deeplinking to a 
      wallet.
      </div>
  </>
}