import chai, { expect } from 'chai';
import spies from 'chai-spies';
import { runCli, processCli } from './cli';
import { fakeApi } from './utils/test.spec';

chai.use(spies);

describe('cli (core)', () => {
  it('must shutdown with command return code', async () => {
    const shutdown = chai.spy();
    const commands = {
      foo: {
        action: () => Promise.resolve(1),
        description: 'foo command description.',
      },
      bar: {
        action: () => Promise.resolve(0),
        description: 'bar command description.',
      },
    };
    await runCli({
      args: ['foo'],
      shutdown,
      commands,
      api: fakeApi(),
    });
    await runCli({
      args: ['bar'],
      shutdown,
      commands,
      api: fakeApi(),
    });
    expect(shutdown).to.have.been.first.called.with(1);
    expect(shutdown).to.have.been.second.called.with(0);
  });
  it('must shutdown with code 1 on unexpected command error', async () => {
    const shutdown = chai.spy();
    const commands = {
      foo: {
        action: () => {
          throw new Error('foo error');
        },
        description: 'foo command description.',
      },
    };
    const api = fakeApi();
    await runCli({
      args: ['foo'],
      shutdown,
      commands,
      api,
    });
    expect(shutdown).to.have.been.called.with(1);
    expect(api.print).to.have.been.called.with('foo error');
  });
  it('invoke command with parameters', async () => {
    const fooAction = chai.spy(() => Promise.resolve(0));
    const code = await processCli({
      parameters: ['foo', 'param1', 'param2'],
      commands: {
        foo: {
          description: 'foo command description.',
          action: fooAction,
        },
      },
      api: fakeApi(),
    });
    expect(fooAction).to.have.been.called.with(['param1', 'param2']);
    expect(code).to.equal(0);
  });

  it('missing command', async () => {
    const api = fakeApi();
    const code = await processCli({
      parameters: [],
      commands: {},
      api,
    });
    expect(api.print).to.have.been.called.with('missing command');
    expect(code).to.equal(1);
  });

  it('default command', async () => {
    const fooAction = chai.spy(() => Promise.resolve(0));
    const code = await processCli({
      parameters: ['param1', 'param2'],
      commands: {
        default: {
          description: 'foo command description.',
          action: fooAction,
        },
      },
      api: fakeApi(),
    });
    expect(fooAction).to.have.been.called.with(['param1', 'param2']);
    expect(code).to.equal(0);
  });
});
