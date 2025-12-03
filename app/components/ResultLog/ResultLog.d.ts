import { VerifyResponse } from "types/credential";
import { CollapsibleSectionProps } from "../ContextualHelp/ContextualHelp";

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
    helpSections?:CollapsibleSectionProps[]
    issuer?:boolean
}