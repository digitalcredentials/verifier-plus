'use client'
import { createContext, useContext } from "react";
import { VerifyResponse } from "../types/credential.d";

export type VerificationContextType = {
  loading: boolean;
  verificationResult: VerifyResponse | null;
  verifyCredential: () => Promise<void>;
  issuerName: string | null;
}

export const VerificationContext = createContext<VerificationContextType>({
  loading: true,
  verificationResult: null,
  verifyCredential: async () => {},
  issuerName: null,
})

export const useVerificationContext = () => {
  return useContext(VerificationContext)
}
