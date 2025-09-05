import { VerifyResponse } from "types/credential";

export type VerificationControlsProps = {
  verificationResult: VerifyResponse;
  verifyCredential: () => Promise<void>;
}