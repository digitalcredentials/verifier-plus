import { fromQrCode } from '@digitalcredentials/vpqr';
import { securityLoader } from '@digitalcredentials/security-document-loader';
import type { VerifiableCredential } from '../types/credential.d';
import { VerifiableObject, extractCredentialsFrom } from './verifiableObject';

const documentLoader = securityLoader().build();
const vpqrPattern = /^VP1-[A-Z|0-9]+/;

export async function credentialsFromQrText(text: string): Promise<VerifiableCredential[] | null> {

  let url;
  try {
    url = new URL(text);
  } catch (e) {
    // wasn't a url, so just continue on
  }

  try {
    if (url?.protocol === "http:" || url?.protocol === "https:") {
      const json = await getJSONFromURL(url.toString())
      const credentials = extractCredentialsFrom(json)
      return credentials;
    }
  } catch (e) {
    // It was a URL but didn't return a credential.
    // TODO: might eventually want to return a more meaningful message
    return null;
  }

  try {
    const { vp }: { vp: VerifiableObject } = await fromQrCode({ text, documentLoader });
    const vc = extractCredentialsFrom(vp);
    return vc;

  } catch (error) {
    // TODO: might eventually want to return a more meaningful message
    return null;
  }

  // TODO: We need to separate verificaiton of the presentation from the credentials inside.
  // https://www.pivotaltracker.com/story/show/179830339
  //const isVerified = await verifyPresentation(vp);

  //if (!isVerified) {
  //  throw new Error(PresentationError.IsNotVerified);
  //}

}

export function isVpqr(text: string): boolean {
  return vpqrPattern.test(text);
}

async function getJSONFromURL(url: string) {
  try {
    // Proxy the request through our backend to avoid CORS
    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching URL:', error);
    return "";
  }
}