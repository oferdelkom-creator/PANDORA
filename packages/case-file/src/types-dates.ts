/** שדות התאריך שהתיק יכול לשאת. */
export type CaseFileDateField =
  | 'judgmentDate'
  | 'decisionDate'
  | 'hearingDate'
  | 'serviceDate'
  | 'learnedDate';

export const DATE_FIELD_HE: Record<CaseFileDateField, string> = {
  judgmentDate: 'מועד מתן פסק הדין',
  decisionDate: 'מועד ההחלטה',
  hearingDate: 'מועד הדיון',
  serviceDate: 'מועד ההמצאה',
  learnedDate: 'מועד הידיעה',
};
