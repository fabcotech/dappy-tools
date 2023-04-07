import chai, { expect } from 'chai';
import spies from 'chai-spies';
import { dohServerCommand } from './dohServerCommand';
import { fakeApi } from '../utils/test.spec';

chai.use(spies);

describe('cli command: dohServer', () => {
  it('should works', async () => {
    const start = chai.spy();
    const api = fakeApi({
      dohServer: () => ({ start }),
    });
    await dohServerCommand.action([], api);

    expect(start).to.have.been.called();
  });
});
