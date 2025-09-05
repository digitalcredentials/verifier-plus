import React from "react";

export type ScanModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onScan: (result: string) => void;
  setErrorMessage: (scanError: boolean) => void;
}