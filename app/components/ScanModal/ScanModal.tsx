import { Button } from '@/components/Button/Button';
import type { ScanModalProps } from './ScanModal.d';
import styles from './ScanModal.module.css';
import { useEffect, useRef, useState } from "react";
//import { QrReader } from 'react-qr-reader';
import QrScanner from 'qr-scanner';
//import { Result } from '@zxing/library';

export const ScanModal = ({ isOpen, setIsOpen, onScan, setErrorMessage }: ScanModalProps) => {

    let scanner : any;
    const videoEl = useRef<HTMLVideoElement>(null);
    const [qrOn, setQrOn] = useState<boolean>(true);

    const onScanSuccess = (result: QrScanner.ScanResult) => {
        console.log(result);
        onScan(result?.data)
        closeModal();
    };

    const onScanFail = (err: string | Error) => {
        // setErrorMessage(true)
        console.log(err);
       // closeModal();
    };

    useEffect(() => {
      
        if (isOpen && videoEl?.current && !scanner) {
  
            scanner = new QrScanner(videoEl?.current, onScanSuccess, {
                onDecodeError: onScanFail,
                preferredCamera: "environment",
                highlightScanRegion: true,
                highlightCodeOutline: true
            });
            scanner?.start()
                .then(() => setQrOn(true))
                .catch((err:any) => {
                    if (err) setQrOn(false);
                    setErrorMessage(true)
                });
        }
        if (!isOpen) {
          scanner?.stop();
        }

        // Clean up on unmount.
        // Removes the QR Scanner from rendering and using camera when it is closed or removed from the UI.
        return () => {
            if (!videoEl?.current) {
                scanner?.stop();
            }
        };
    }, [isOpen]);

    // If "camera" is not allowed in browser permissions, show an alert.
    useEffect(() => {
        if (!qrOn)
            alert(
                "Camera is blocked or not accessible. Please allow camera in your browser permissions and Reload."
            );
    }, [qrOn]);



/*   const handleScan = (newData?: Result | null, error?: Error | null) => {
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
  } */
 
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
                <div className="qr-reader">
                 <video className={styles.qrReader} ref={videoEl}></video>
                 </div>
              {/*  <QrReader 
                  onResult={(result, error) => handleScan(result, error)}
                  constraints={{facingMode: "environment"}}
                  className={styles.qrReader}
                /> */}
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