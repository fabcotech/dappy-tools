import { Command } from './command';
import { createHelpCommand } from './helpCommand';
import { lookupCommand } from './lookupCommand';
import { saveCertificateCommand } from './saveCertificateCommand';

export { Command } from './command';

export const getCommands = (): { [key: string]: Command } => {
  const commands = {
    lookup: lookupCommand,
    savecertificate: saveCertificateCommand,
    default: lookupCommand,
  } as { [key: string]: Command };

  commands.help = createHelpCommand(commands);

  return commands;
};
