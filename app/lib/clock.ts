/** The current time. Services take it from the app context so tests can fix it. */
export type Clock = () => Date;

export function SystemClock(): Clock {
  return () => new Date();
}
