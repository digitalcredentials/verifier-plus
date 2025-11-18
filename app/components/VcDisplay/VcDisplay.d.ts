import React, { ReactElement, ReactNode } from "react"

export type VcDisplayProps = {
  title?: string;
  link: string;
}

export type CollapsibleSectionProps = {
  sectionTitle: string;
  content: ReactNode;
}

export type JsonViewProps = {
  link: string;
}

export type JSONLinkProps = {
  link: string;
}

export type VerifierPlusLinkProps = {
  link: string;
}