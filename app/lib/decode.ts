import { fromQrCode } from '@digitalcredentials/vpqr';
import { securityLoader } from '@digitalcredentials/security-document-loader';
import type { VerifiableCredential } from '../types/credential.d';
import { VerifiableObject, extractCredentialsFrom } from './verifiableObject';

const documentLoader = securityLoader().build();
const vpqrPattern = /^VP1-[A-Z|0-9]+/;

export async function credentialsFromQrText(text: string): Promise<VerifiableCredential[] | null> {

  try {
    const { vp }: { vp: VerifiableObject } = await fromQrCode({ text, documentLoader });
    const vc = extractCredentialsFrom(vp);
    return vc;

  } catch (error) {
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
