'use client'
import { useCallback, useEffect, useRef, useState } from 'react';
import { VerifiableCredential, VerifyResponse } from '../types/credential.d';
import { VerificationContextType } from './verificationContext';

export const useVerification = (credential?: VerifiableCredential) => {
  const [verificationResult, setVerificationResult] = useState<VerifyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [timerExpired, setTimerExpired] = useState(false);
  const timeout = useRef<number>(0);
  //console.log('Trying to verify:', credential)

  const issuerName = typeof credential?.issuer === 'string' ? credential?.issuer : credential?.issuer.name;

  const verifyCredential = useCallback(async () => {
    if (credential === undefined) {
      return;
    }
    setLoading(true);
    setTimerExpired(false);


    // artificial delay for UI purposes
    timeout.current = window.setTimeout(() => {
      setTimerExpired(true);
    }, 1000);
    const res = await fetch('/api/verify', {
      method: 'POST',
      body: JSON.stringify(credential)
    });

    const { result } = await res.json();
    setVerificationResult(result);
    setLoading(false);
  }, [credential]);

  useEffect(() => {
    verifyCredential()
    return () => {
      window.clearTimeout(timeout.current);
    }
  }, [verifyCredential]);

  return { loading: loading || !timerExpired, verificationResult, verifyCredential, issuerName } as VerificationContextType
}
