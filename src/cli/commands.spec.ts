import chai, { expect } from 'chai';
import spies from 'chai-spies';
import { createHelpCommand, lookupCommand } from './commands';
import { dedent } from './utils/dedent';

chai.use(spies);

describe('cli (commands)', () => {
  it('help: no arguments, list all commands', async () => {
    let stdout = '';
    const print = (str: string) => {
      stdout += `${str}\n`;
    };
    const commands = {
      foo: {
        description: 'foo command description.',
        action: () => Promise.resolve(0),
      },
      bar: {
        description: 'bar command description.',
        action: () => Promise.resolve(0),
      },
    };
    await createHelpCommand(commands).action([], {
      print,
      lookup: () => Promise.resolve(undefined),
    });
    expect(stdout).to.contains(dedent`
    Available commands:
      * foo
      * bar
    `);
  });
  it('help: display command description', async () => {
    let stdout = '';
    const print = (str: string) => {
      stdout += `${str}\n`;
    };
    const commands = {
      foo: {
        description: 'foo command description.',
        action: () => Promise.resolve(0),
      },
      bar: {
        description: 'bar command description.',
        action: () => Promise.resolve(0),
      },
      default: {
        description: 'default command description.',
        action: () => Promise.resolve(0),
      },
    };
    await createHelpCommand(commands).action(['foo'], {
      print,
      lookup: () => Promise.resolve(undefined),
    });
    expect(stdout).to.contains(commands.foo.description);
  });
  it('help: command not found', async () => {
    let stdout = '';
    const print = (str: string) => {
      stdout += `${str}\n`;
    };
    const commands = {};
    const code = await createHelpCommand(commands).action(['foo'], {
      print,
      lookup: () => Promise.resolve(undefined),
    });
    expect(stdout).to.contains('command not found');
    expect(code).to.eql(1);
  });
  it('lookup: missing name', async () => {
    const lookup = () => Promise.resolve(undefined);
    const print = chai.spy();
    const code = await lookupCommand.action([], {
      lookup,
      print,
    });
    expect(print).to.have.been.called.with('missing name');
    expect(code).to.eql(1);
  });
});
