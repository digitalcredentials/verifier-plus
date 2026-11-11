import { expect, type Page } from "@playwright/test";
import { LogMessages } from "@/components/ResultLog/ResultLog";
import { TestId } from "@/lib/testIds";

/** The accessible names of the status icons beside each verification log line. */
export enum LogIcon {
    Positive = 'green checkmark',
    Warning = 'yellow warning',
    Negative = 'red x',
}

/** The icon ResultLog shows beside each message. */
const iconForMessage: Record<LogMessages, LogIcon | undefined> = {
    [LogMessages.WellFormed]: LogIcon.Positive,
    [LogMessages.ValidSignature]: LogIcon.Positive,
    [LogMessages.KnownIssuer]: LogIcon.Positive,
    [LogMessages.NotRevoked]: LogIcon.Positive,
    [LogMessages.HasNotExpired]: LogIcon.Positive,
    [LogMessages.NoExpirationDate]: LogIcon.Positive,
    [LogMessages.NotSuspended]: LogIcon.Positive,
    [LogMessages.UnknownIssuer]: LogIcon.Warning,
    [LogMessages.HasExpired]: LogIcon.Warning,
    [LogMessages.MalFormed]: LogIcon.Negative,
    [LogMessages.InvalidSignature]: LogIcon.Negative,
    [LogMessages.Revoked]: LogIcon.Negative,
    [LogMessages.UncheckedRevocation]: LogIcon.Negative,
    [LogMessages.Suspended]: LogIcon.Negative,
    // not log lines
    [LogMessages.GeneralError]: undefined,
    [LogMessages.UnknownError]: undefined,
};

export type ExpectedLog = {
    wellFormed: LogMessages,
    signature: LogMessages,
    issuer: LogMessages,
    revocation: LogMessages,
    expiry: LogMessages,
};

const lineTestIds: Record<keyof ExpectedLog, TestId> = {
    wellFormed: TestId.MalformedLogMsg,
    signature: TestId.SigningLogMsg,
    issuer: TestId.IssuerLogMsg,
    revocation: TestId.RevocationLogMsg,
    expiry: TestId.ExpirationLogMsg,
};

/**
 * Checks the status icon beside each log line: a green checkmark, yellow
 * warning or red x, as its message calls for. Each line is an icon and its
 * message under one parent element.
 */
export async function expectLogIcons(page: Page, expected: ExpectedLog) {
    for (const [line, message] of Object.entries(expected) as [keyof ExpectedLog, LogMessages][]) {
        const icon = iconForMessage[message];
        if (!icon) throw new Error(`'${message}' is not a log line message`);
        const lineElement = page.getByTestId(lineTestIds[line]).locator('..');
        await expect(lineElement.getByRole('img'), `${line} icon`).toHaveAccessibleName(icon);
    }
}
