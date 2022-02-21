import { Command, getCommands } from './commands';
import { Api, print } from './api';

function shutdown(code: number) {
  process.exit(code);
}

export async function processCli({
  parameters,
  commands,
  api,
}: {
  parameters: string[];
  commands: { [key: string]: Command };
  api: Api;
}) {
  let cmdName;
  let cmdParameters = [''];

  if (!parameters[0].startsWith('--')) {
    cmdName = 'default';
    cmdParameters = parameters;
  } else {
    cmdName = parameters[0].replace(/^-+/, '');
    cmdParameters = parameters.slice(1);
  }

  if (!commands[cmdName]) {
    throw new Error(`Unknown command: ${cmdName}`);
  }
  await commands[cmdName].action(cmdParameters, api);
}

export async function runCli({ args }: { args?: string[] } = {}) {
  const parameters = !args ? process.argv.slice(2) : args;

  let result;
  let code = 0;

  try {
    result = await processCli({
      parameters,
      commands: getCommands(),
      api: {
        print,
      },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log((err as Error).message);
    code = 1;
  } finally {
    await shutdown(code);
  }

  return { result };
}
