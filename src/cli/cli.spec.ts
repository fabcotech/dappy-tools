import chai, { expect } from 'chai';
import spies from 'chai-spies';
import { processCli } from './cli';

chai.use(spies);

describe('cli (core)', () => {
  it('invoke command with parameters', async () => {
    const fooAction = chai.spy(() => Promise.resolve());
    await processCli({
      parameters: ['foo', 'param1', 'param2'],
      commands: {
        foo: {
          description: 'foo command description.',
          action: fooAction,
        },
      },
      api: {
        print: () => {},
      },
    });
    expect(fooAction).to.have.been.called.with(['param1', 'param2']);
  });

  it('missing command', async () => {
    try {
      await processCli({
        parameters: [],
        commands: {},
        api: {
          print: () => {},
        },
      });
    } catch (e) {
      expect((e as Error).message).to.equal('missing command');
    }
  });

  it('default command', async () => {
    const fooAction = chai.spy(() => Promise.resolve());
    await processCli({
      parameters: ['param1', 'param2'],
      commands: {
        default: {
          description: 'foo command description.',
          action: fooAction,
        },
      },
      api: {
        print: () => {},
      },
    });
    expect(fooAction).to.have.been.called.with(['param1', 'param2']);
  });
});
