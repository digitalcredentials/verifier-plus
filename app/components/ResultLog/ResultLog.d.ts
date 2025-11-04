import { VerifyResponse } from "types/credential";

export type ResultLogProps = {
  verificationResult: VerifyResponse;
}

export type ResultItem = {
    verified:boolean,
    positiveMessage:string,
    negativeMessage?:string,
    warningMessage?:string,
    sourceLogId?:string,
    testId:string,
    helpTitle?:string, 
    HelpContent?:ReactElement,
    issuer?:boolean
}