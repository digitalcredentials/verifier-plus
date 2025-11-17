import React, { ReactElement, ReactNode } from "react"

export type ContextualHelpProps = {
  title?: string;
  description?: ReactNode;
  children?: ReactNode;
  iconSize?: string;
  iconColor?: string;
  style?: string;
  sections?: CollapsibleSectionProps[]
}

export type CollapsibleSectionProps = {
  sectionTitle: string;
  content: ReactNode;
}