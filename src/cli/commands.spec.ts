import { expect } from 'chai';
import { createHelpCommand } from './commands';
import { dedent } from './utils/dedent';

describe('cli (commands)', () => {
  it('helpCommand: no arguments, list all commands', async () => {
    let stdout = '';
    const print = (str: string) => {
      stdout += `${str}\n`;
    };
    const commands = {
      foo: {
        description: 'foo command description.',
        action: () => Promise.resolve(),
      },
      bar: {
        description: 'bar command description.',
        action: () => Promise.resolve(),
      },
    };
    await createHelpCommand(commands).action([], { print });
    expect(stdout).to.contains(dedent`
    Available commands:
      * foo
      * bar
    `);
  });
  it('helpCommand: display command description', async () => {
    let stdout = '';
    const print = (str: string) => {
      stdout += `${str}\n`;
    };
    const commands = {
      foo: {
        description: 'foo command description.',
        action: () => Promise.resolve(),
      },
      bar: {
        description: 'bar command description.',
        action: () => Promise.resolve(),
      },
      default: {
        description: 'default command description.',
        action: () => Promise.resolve(),
      },
    };
    await createHelpCommand(commands).action(['foo'], { print });
    expect(stdout).to.contains(commands.foo.description);
  });
  it('helpCommand: command not found', async () => {
    let stdout = '';
    const print = (str: string) => {
      stdout += `${str}\n`;
    };
    const commands = {};
    await createHelpCommand(commands).action(['foo'], { print });
    expect(stdout).to.contains('command not found');
  });
});
