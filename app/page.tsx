'use client'
import styles from './index.module.css'
import { Accordion } from '@/components/Accordion/Accordion'
import { Button } from '@/components/Button/Button'
import { useEffect, useState } from 'react'
import { ScanModal } from '@/components/ScanModal/ScanModal'
import { CredentialCard } from '@/components/CredentialCard/CredentialCard'
import { Container } from '@/components/Container/Container'
import { VerificationCard } from '@/components/VerificationCard/VerificationCard'
import { VerificationContext } from '@/lib/verificationContext'
import { VerifiableCredential } from '@/types/credential'
import { useVerification } from '@/lib/useVerification'
import { credentialsFromQrText } from '@/lib/decode';
import { TopBar } from '@/components/TopBar/TopBar'
import { BottomBar } from '@/components/BottomBar/BottomBar'
import { extractCredentialsFrom, VerifiableObject } from '@/lib/verifiableObject'
import { QRCodeSVG } from 'qrcode.react';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link'
import { pollExchange } from '@/lib/exchanges';
import packageJson from '../package.json';
import * as polyfill from 'credential-handler-polyfill'

// NOTE: We currently only support one credential at a time. If a presentation with more than one credential
// is dropped, pasted, or scanned we only look at the first one

const randomPageId = uuidv4();


export default function Home() {
  const [textArea, setTextArea] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [textAreaError, setTextAreaError] = useState(false);
  const [fileError, setFileError] = useState(false);
  const [scanError, setScanError] = useState(false);
  const [credential, setCredential] = useState<VerifiableCredential | undefined>(undefined);
  const credentialContext = useVerification(credential);
  const [wasMulti, setWasMulti] = useState(false);
  const { version } = packageJson;

  useEffect(() => {
    document.documentElement.lang = "en";
    document.title = "VerifierPlus Home page";

    polyfill.loadOnce()
      .then((_: any) => { console.log('CHAPI polyfill loaded.') })
      .catch((e: any) => { console.error('Error loading CHAPI polyfill:', e) })

    const handlePopstate = (event: PopStateEvent) => {
      if (event.state && event.state.credential) {
        setCredential(event.state.credential);
        return;
      }

      if (window.location.hash === '/') {
        setCredential(undefined);
        setWasMulti(false);
        setTextArea('');
      } else if (window.location.hash.startsWith('#verify')) {
        const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
        const vcUrl = urlParams.get('vc');
        if (vcUrl) {
          getJSONFromURL(decodeURIComponent(vcUrl)).then(json => {
            if (json) {
              verifyCredential(json);
            }
          });
        }
      } else if (window.location.hash === '') {
        setCredential(undefined);
        setWasMulti(false);
        setTextArea('');
      } else {
        history.replaceState(null, '', '/');
        setCredential(undefined);
        setWasMulti(false);
        setTextArea('');
      }
    };

    // Set initial state
    if (window.location.hash.startsWith('#verify')) {
      const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
      const vcUrl = urlParams.get('vc');
      if (vcUrl) {
        getJSONFromURL(decodeURIComponent(vcUrl)).then(json => {
          if (json) {
            const parsedJson = JSON.parse(json);
            const vc = extractCredentialsFrom(parsedJson);
            if (vc && vc.length > 0) {
              const state = { credential: vc[0] };
              history.replaceState(state, '', window.location.hash);
              setCredential(vc[0]);
              if (vc.length > 1) {
                setWasMulti(true);
              }
            }
          }
        });
      }
    } else {
      // Set initial state for home page
      history.replaceState({ credential: undefined }, '', window.location.hash || '/');
    }

    window.addEventListener('popstate', handlePopstate);
    return () => window.removeEventListener('popstate', handlePopstate);
  }, []);






  useEffect(() => {
    if (credential === undefined) {
      setTextAreaError(false);
      setFileError(false);
      setScanError(false);
    }
  }, [credential])





  useEffect(() => {
    if (file !== null) {
      const reader = new FileReader();

      reader.onload = (e) => {
        let text = e.target?.result as string ?? '';
        if (file.type == 'image/png') {
          // Search for keyword and extract the object following it
          const keyword = 'openbadgecredential';
          const keywordIndex = text.indexOf(keyword);

          // Check if the keyword is found
          if (keywordIndex !== -1) {
            // Extract the portion of the string after the keyword
            const startIndex = keywordIndex + keyword.length;

            // Find start of the object
            const objectStart = text.indexOf('{', startIndex);

            if (objectStart !== -1) {
              // Find matching closing brace
              let braceCount = 0;
              let objectEnd = objectStart;

              while (objectEnd < text.length) {
                if (text[objectEnd] === '{') {
                  braceCount++;
                } else if (text[objectEnd] === '}') {
                  braceCount--;
                }

                // When brace count goes back to zero = found the end of object
                if (braceCount === 0) {
                  break;
                }

                objectEnd++;
              }

              // Slice string to capture the entire object (including braces)
              const objectString = text.slice(objectStart, objectEnd + 1);

              // Parse object
              try {
                const parsedObject = JSON.parse(objectString);
                text = JSON.stringify(parsedObject, null, 2);
              } catch (error) {
                console.error('Failed to parse JSON:', error);
              }
            }
          } else {
            console.log('Keyword not found');
          }
        }

        const result = verifyCredential(text);
        if (!result) {
          console.log('file parse error');
          setFileError(true);
        } else {
          setFileError(false);
        }
      };
      reader.readAsText(file, 'UTF-8');
    }
  }, [file]);

  function checkJson(json: string) {
    try {
      JSON.parse(json);
    } catch {
      return false;
    }
    return true;
  }

  function verifyCredential(json: string) {
    const result = checkJson(json);

    if (!result) { return result; }
    const parsedJson = JSON.parse(json);
    let newCredential: VerifiableObject = parsedJson;

    const vc = extractCredentialsFrom(newCredential);
    if (vc === null) { return; }
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const vcUrl = urlParams.get('vc');

    // Create a new history state
    const state = { credential: vc[0] };

    if (vcUrl) {
      // If we're coming from a URL, replace the current state
      history.replaceState(state, '', `#verify?vc=${vcUrl}`);
    } else {
      // If we're navigating within the app, push a new state
      history.pushState(state, '', '#verify/results');
    }

    // get first cred. this will eventually need to be changed
    if (vc.length > 1) { setWasMulti(true); }
    setCredential(vc[0]);
    return result;
  }

  function ScanButtonOnClick() {
    setIsOpen(!isOpen);
  }

  async function requestVcOnClick() {
    const credentialQuery = {
      web: {
        VerifiablePresentation: {
          query: [
            {
              type: 'QueryByExample',
              credentialQuery: {
                reason: 'VerifierPlus is requesting any credential for verification.',
                example: {
                  type: ['VerifiableCredential']
                }
              }
            }
          ]
        }
      }
    } as CredentialRequestOptions

    const chapiResult = await navigator.credentials.get(credentialQuery) as any

    if (!chapiResult?.data) {
      console.log('no credentials received');
    }

    const { data: vp } = chapiResult
    // @ts-ignore
    const vc = extractCredentialsFrom(vp)[0]

    setCredential(vc)
  }

  async function getJSONFromURL(url: string) {
    try {
      // Proxy the request through our backend to avoid CORS
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseJson = await response.json();
      return JSON.stringify(responseJson);
    } catch (error) {
      console.error('Error fetching URL:', error);
      return "";
    }
  }

  async function verifyTextArea() {
    // check if textarea is json
    let input = "";
    if (!checkJson(textArea)) {
      // If it's a URL, redirect to the verify route with query param
      if (textArea.startsWith('http')) {
        history.pushState(null, '', `/#verify?vc=${encodeURIComponent(textArea)}`);
        const json = await getJSONFromURL(textArea);
        console.log('🚀 ~ verifyTextArea ~ json:', json)
        if (json) {
          verifyCredential(json);
        }
        return;
      }
      const fromUrl = await getJSONFromURL(textArea);
      if (fromUrl !== "") {
        input = fromUrl;
      }
    } else {
      input = textArea;
    }

    const result = verifyCredential(input);
    if (!result) {
      setTextAreaError(true);
    } else {
      setTextAreaError(false);
    }
  }

  async function onScan(json: string): Promise<Boolean> {
    const fromqr = await credentialsFromQrText(json);
    if (fromqr === null) { return false; }
    // get first cred. this will eventually need to be changed
    const cred = fromqr[0];

    history.pushState(null, '', '#verify/results');
    if (fromqr.length > 1) { setWasMulti(true); }
    setCredential(cred);
    return true;
  }

  function handleFileDrop(e: React.DragEvent<HTMLInputElement>) {
    console.log("file was dropped");
    e.stopPropagation();
    e.preventDefault();
    setFile(e.dataTransfer.items[0].getAsFile())
  }

  function handleBrowse(e: React.ChangeEvent<HTMLInputElement>) {
    // console.log(e);
    setFile(e.target.files !== null ? e.target.files[0] : null);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.currentTarget.click();
    }
  }

  if (credential !== undefined) {
    return (
      <main className={styles.container}>
        <TopBar hasLogo={true} isDark={isDark} setIsDark={setIsDark} setCredential={setCredential} />
        <div className={styles.verifyContainer}>
          <VerificationContext.Provider value={credentialContext}>
            <Container>
              <CredentialCard credential={credential} wasMulti={wasMulti} />
              <VerificationCard />
            </Container>
          </VerificationContext.Provider>
        </div>

        <BottomBar isDark={isDark} />
      </main>
    );
  }


  const EXCHANGE_SERVER_URL = process.env.NEXT_PUBLIC_EXCHANGE_SERVER_URL // e.g.,'https://verifierplus.org';

  const WALLET_DEEP_LINK = 'https://lcw.app/request'
  const exchangeUrl = `${EXCHANGE_SERVER_URL}/api/exchanges/${randomPageId}`

  const chapiRequest = {
    credentialRequestOrigin: EXCHANGE_SERVER_URL,
    protocols: {
      vcapi: exchangeUrl
    }
  }

  const encodedRequest = encodeURI(JSON.stringify(chapiRequest));
  const lcwRequestUrl = `${WALLET_DEEP_LINK}?request=${encodedRequest}`;

  const lcwIcon = <span><img className={styles.lcwIcon} src="/LcwIcon.png" alt="LCW icon" /></span>
  const spinner = <span className={styles.spinner}></span>

  const startPolling = () => {
    let newIntervalId = window.setInterval(async () => {
      await pollExchange({
        exchangeUrl,
        onFetchVP: (vp: any) => {
          const parsed = JSON.parse(vp);
          setCredential(parsed.verifiablePresentation.verifiableCredential[0]);
          if (!credential) { // Only set credential if it hasn't been set yet
            setCredential(parsed.verifiablePresentation.verifiableCredential[0]);
          } else {
            window.clearInterval(newIntervalId);
            stopPolling(newIntervalId);
          }
        },
        stopPolling: () => stopPolling(newIntervalId), // Adjusted to match the expected signature
      });
    }, 3000); // poll every 3 seconds
  };

  const stopPolling = (newIntervalId: string | number | NodeJS.Timeout | undefined) => {
    if (newIntervalId) {
      clearInterval(newIntervalId); // Clear the interval when stopping polling
    }
  };

  return (
    <main className={styles.container}>
      <TopBar isDark={isDark} setIsDark={setIsDark} setCredential={setCredential} />
      <div className={styles.contentContainer}>
        <div>
          <h1 className={styles.title}>
            VerifierPlus
          </h1>
          <p className={styles.version}>Version {version}</p>
          <p className={styles.descriptionBlock}>
            VerifierPlus allows users to verify any <Link href='faq#supported'>supported</Link> digital academic
            credential.
            This site is hosted by
            the <a href='https://digitalcredentials.mit.edu/'>Digital Credentials Consortium</a>
            , a network of leading international universities designing an open
            infrastructure for digital academic credentials. <Link href='faq#trust'>Why trust us?</Link>
          </p>
        </div>

        {scanError && (
          <div className={styles.errorContainer}>
            <span className="material-icons-outlined">
              warning
            </span>
            <p className={styles.error}>
              Invalid QR code
            </p>
          </div>
        )}

        <div className={styles.lcwContainer} data-testid="lcw-request-btn">
          <Accordion
            iconClosed={lcwIcon}
            iconOpen={spinner}
            onOpen={startPolling}
            onClose={() => stopPolling(undefined)}
            title="Request credentials from LCW" >
            {/*             <p>
              <a className={styles.lcwLink} target={'_blank'} rel={'noreferrer'} href={lcwRequestUrl}><h3>Mobile Link</h3></a>
            </p> */}
            <div><h5 className={styles.lcwLink}>Scan QR code with phone camera to open:</h5></div>
            <div className={styles.qrCode}>
              <QRCodeSVG value={lcwRequestUrl} data-testid="lcw-qr-request" data-testvalue={lcwRequestUrl}/>
            </div>
          </Accordion>
        </div>

        <div className={styles.textAreaContainer}>
          <div className={styles.floatingTextarea}>
            <textarea
              aria-labelledby='textarea-label'
              placeholder=' '
              value={textArea}
              onChange={(e) => setTextArea(e.target.value)}
              id='textarea'
              data-testid="vc-text-area"
            />
            <label id='textarea-label' htmlFor='textarea'>Paste JSON or URL</label>
          </div>
          <Button data-testid="verify-btn" className={styles.verifyTextArea} text='Verify' onClick={verifyTextArea}/>
        </div>

        {textAreaError && (
          <div className={styles.errorContainer}>
            <span className="material-icons-outlined">
              warning
            </span>
            <p className={styles.error}>
              The JSON is not a Verifiable Credential or an Open Badge 3.0
            </p>
          </div>
        )}

        <div
          className={styles.dndUpload}
          onDrop={handleFileDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <label htmlFor="file-upload" className={styles.dndUploadText}>
            Drag and drop a file here or {' '}
            <span className={styles.browseLink}>
              browse
            </span>
          </label>

          <input
            type="file"
            id="file-upload"
            className={styles.visuallyHidden}
            onChange={handleBrowse}
            accept=".json,.png"
          />

          <span className={styles.supportText}>Supports JSON</span>
        </div>

        <div style={{ marginTop: '1em' }}>
          <Button
            icon={<span className="material-icons">qr_code_scanner</span>}
            className={styles.scan}
            text='Scan QR Code'
            onClick={ScanButtonOnClick}
          />
        </div>

        {fileError && (
          <div className={styles.errorContainer}>
            <span className="material-icons-outlined">
              warning
            </span>
            <p className={styles.error}>
              Json cannot be parsed
            </p>
          </div>
        )}

        <div>
          <Button
            icon={<span className="material-icons">wallet</span>}
            className={styles.scan}
            text='Request from web wallet via CHAPI'
            onClick={requestVcOnClick}
          />
        </div>

        <ScanModal isOpen={isOpen} setIsOpen={setIsOpen} onScan={onScan} setErrorMessage={setScanError} />
      </div>
      <BottomBar isDark={isDark} />
    </main>
  )
}