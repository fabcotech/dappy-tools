import { DappyRecord } from '../types';
import { mergeDeep } from './mergeDeep';

export const createDappyRecord = (
  record: Partial<DappyRecord> = {},
): DappyRecord =>
  mergeDeep(
    {
      values: [
        {
          value: '127.0.0.1',
          kind: 'IPv4',
        },
      ],
      ca: ['123456789ABCDEF', '123456789ABCDEF'],
    },
    record,
  );
