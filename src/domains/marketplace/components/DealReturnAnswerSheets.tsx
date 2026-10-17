import React, { memo } from 'react';
import type { DealReturnModel } from '../hooks/useDealReturn';
import type { DealReturnAnswerModel } from '../hooks/useDealReturnAnswer';
import type { Deal } from '../types';
import { DealReturnIssueSheet } from './DealReturnIssueSheet';
import { DealReturnReceiveSheet } from './DealReturnReceiveSheet';
import { DealReturnWaiveSheet } from './DealReturnWaiveSheet';

export interface DealReturnAnswerSheetsProps {
  deal: Deal;
  ret: DealReturnModel;
  answer: DealReturnAnswerModel;
}

/** The brand's three answers to a returned sample, mounted once beside the deal page. */
const DealReturnAnswerSheetsComponent: React.FC<DealReturnAnswerSheetsProps> = ({ deal, ret, answer }) => (
  <>
    <DealReturnReceiveSheet deal={deal} ret={ret} answer={answer} />
    <DealReturnIssueSheet deal={deal} answer={answer} />
    <DealReturnWaiveSheet deal={deal} answer={answer} />
  </>
);

export const DealReturnAnswerSheets = memo(DealReturnAnswerSheetsComponent);
