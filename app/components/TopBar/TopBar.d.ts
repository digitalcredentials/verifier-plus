import { ReactNode } from "react"

export type TopBarProps = {
  isDark: boolean;
  hasLogo?: boolean;
  setIsDark: function;
  setCredential?: function;
}