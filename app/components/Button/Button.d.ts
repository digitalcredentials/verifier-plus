import React, { ReactElement } from "react"

export type ButtonProps = {
  secondary?: boolean;
  text: string;
  icon?: ReactElement | null;
  onClick?: (e: React.SyntheticEvent) => void;
  className?: string;
  children?: ReactElement;
}
