import type { IssuerObject } from 'types/credentials';

export type IssuerProps = {
  issuer: IssuerObject;
  header: string;
  infoButtonPushed: () => void;
}