import React, { ReactElement } from "react"

export type ToggleSwitchProps = {
  icon: ReactElement;
  isOn: boolean;
  handleToggle: () => void;
  name: string;
  ariaLabel: string;
}