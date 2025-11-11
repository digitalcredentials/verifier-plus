'use client'
import { createContext, useContext } from "react";

/* boolean to indicate if help is on or off, i.e,
if the help icons should be shown or not.
We use a react context here, rather than a global,
because react contexts automagically refresh
any react elements that are using them.*/

export const HelpContext = createContext<boolean>(true)

export const useHelpContext = () => {
  return useContext(HelpContext)
}
