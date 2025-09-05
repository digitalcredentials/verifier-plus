import { Button } from 'components/Button/Button';
import type { ScanModalProps } from './ScanModal.d';
import styles from './ScanModal.module.css';
import { QrReader } from 'react-qr-reader';
import { Result } from '@zxing/library';

export const ScanModal = ({ isOpen, setIsOpen, onScan, setErrorMessage }: ScanModalProps) => {
  
  const handleScan = (newData?: Result | null, error?: Error | null) => {
    if (newData){
      const res = onScan(newData.getText());
      closeModal();
      if (newData.getText()) {
        setErrorMessage(true);
      }
    }

    if (error){
      console.log(error);
    }
  }
 
  function closeModal() {
    setIsOpen(false);
  }

  return (
    <div>
      {
        isOpen ? (
          <>
          <div className={styles.overlay} onClick={closeModal} >
            <div className={styles.container}>
              <div className={styles.topRow}>
                <span className={styles.title}>Scan a QR Code</span>
                <button onClick={closeModal} className={styles.closeModalButton}>
                  <span className="material-icons-outlined">close</span>
                </button>
              </div>
              <div className={styles.cameraContainer}>
                <QrReader 
                  onResult={(result, error) => handleScan(result, error)}
                  constraints={{facingMode: "environment"}}
                  className={styles.qrReader}
                />
              </div>
              <div className={styles.bottomRow}>
                <Button 
                  className={styles.closeButton} 
                  text='Close'
                  onClick={closeModal} 
                />
              </div>
            </div>
          </div>
          </>
        ) : null
      }
    </div>
  )
}