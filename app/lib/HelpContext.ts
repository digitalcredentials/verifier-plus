'use client'
import { createContext, useContext } from "react";

export type HelpContextType = {
  isHelpEnabled: boolean;
  toggleHelp: () => void;
}

/* We use a react context here, rather than a global,
because react contexts automagically refresh
any react elements that are using them when the context changes.*/

export const HelpContext = createContext<HelpContextType>({isHelpEnabled:true,toggleHelp:()=>{}})

export const useHelpContext = () => {
  return useContext(HelpContext)
}
