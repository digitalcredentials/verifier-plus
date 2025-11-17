import { CollapsibleSectionProps } from "../ContextualHelp/ContextualHelp";

export type InfoBlockProps = {
  header: string;
  contents: string;
  testId?: string;
  HelpContent?: ReactElement;
  helpTitle?:string;
  helpSections?: CollapsibleSectionProps[]
}