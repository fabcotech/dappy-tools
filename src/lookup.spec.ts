import { expect } from 'chai';
import { getXRecords } from './lookup';
import { createDappyRecord } from './utils/fakeData';

describe('tests', () => {
  it('should lookup a record', async () => {
    const record = createDappyRecord();
    const encodedRecord = [
      Buffer.from(
        JSON.stringify({
          success: true,
          records: [
            {
              data: JSON.stringify(record),
            },
          ],
        }),
      ),
    ];

    const fakeRequest = () => Promise.resolve(encodedRecord);

    const r = await getXRecords(fakeRequest)('foo');
    expect(r).to.eql(record);
  });

  it('should throw an error on rchain error', async () => {
    const encodedRecord = [
      Buffer.from(
        JSON.stringify({
          success: false,
          error: {
            message: 'unknown error',
          },
        }),
      ),
    ];

    const fakeRequest = () => Promise.resolve(encodedRecord);

    let throwExp = false;
    try {
      await getXRecords(fakeRequest)('foo');
    } catch (e) {
      throwExp = true;
      expect((e as Error).message).to.eql('unknown error');
    }

    expect(throwExp).to.equal(true, 'Expected an error to be thrown');
  });
});
