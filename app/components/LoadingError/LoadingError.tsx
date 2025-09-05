import styles from './LoadingError.module.css'

export const LoadingError = () => {

  return(
    <div className={styles.loadingErrorContainer}>
      <h1 className={styles.errorCode}>404 credential not found</h1>
      <h3 className={styles.message}>Please check to make sure you’re visiting the correct link.</h3>
      <h3 className={styles.message}>You may also want to check with the credential holder to see if they have unshared the credential or it has expired.</h3>
    </div>
  )
}