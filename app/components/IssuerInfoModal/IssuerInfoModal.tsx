import type { IssuerInfoModalProps } from './IssuerInfoModal.d';
import styles from './IssuerInfoModal.module.css';

export const IssuerInfoModal = ({ isOpen, setIsOpen, issuer }: IssuerInfoModalProps) => {
  // TODO: get the registries from the issuer
  const closeModal = () => {
    setIsOpen(false);
  }

  return (
    <div>
      {
        isOpen ? (
          <>
            <div className={styles.overlay} onClick={closeModal}>
              <div className={styles.container}>
                <div className={styles.section}>
                  <div>
                    <p className={styles.header}>Issuer Name</p>
                    <p className={styles.issuerName}>{issuer.name}</p>
                  </div>
                </div>

                <div className={styles.section}>
                  <div>
                    <p className={styles.header}>Issuer Url</p>
                    <a href={issuer.url}>{issuer.url}</a>
                  </div>
                </div>

                <div>
                  <div>
                    <p className={styles.header}>Registries</p>
                    <ul className={styles.unorderedList}>
                      <li>remove me</li>
                      <li>remove me</li>
                      <li>remove me</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null
      }
    </div>
  )
}
