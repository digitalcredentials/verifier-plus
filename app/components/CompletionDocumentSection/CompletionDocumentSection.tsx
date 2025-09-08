import { InfoBlock } from '@/components/InfoBlock/InfoBlock';
import { DateTime } from 'luxon';
import type { CompletionDocumentSectionProps } from './CompletionDocumentSection.d';
import styles from './CompletionDocumentSection.module.css';

export const CompletionDocumentSection = ({ completionDocument }: CompletionDocumentSectionProps) => {
  const {numberOfCredits, startDate, endDate} = completionDocument;

  return (
    <div>
      {numberOfCredits !== undefined && (
        <InfoBlock header="Number of Credits" contents={numberOfCredits.value as string} />
      )}
      <div className={styles.dateContainer}>
        {startDate !== undefined && (
          <InfoBlock header="Start Date" contents={DateTime.fromISO(startDate).toLocaleString(DateTime.DATE_MED)} />
        )}
        {endDate !== undefined && (
          <InfoBlock header="End Date" contents={DateTime.fromISO(endDate).toLocaleString(DateTime.DATE_MED)} />
        )}
      </div>
    </div>
  );
};
