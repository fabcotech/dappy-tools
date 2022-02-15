import { expect } from 'chai';
import { getXRecords } from './lookup';
import { createDappyRecord } from './utils/fakeData';

describe('lookup', () => {
  it('getXRecords() should resolve a name', async () => {
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

  it('getXRecords() throw an error on rchain error', async () => {
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
