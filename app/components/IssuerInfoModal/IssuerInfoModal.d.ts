import React from "react";

export type IssuerInfoModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  issuer: IssuerObject;
}