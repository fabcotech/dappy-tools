import chai, { expect } from 'chai';
import spies from 'chai-spies';
import { ReturnCode } from '..';
import {
  createNamePacketErrorResponse,
  createNamePacketQuery,
  createNamePacketSuccessResponse,
  getFakeDappyNetworkMember,
} from '../model/fakeData';
import {
  createHelpCommand,
  lookupCommand,
  isNetworkIdArgs,
  getArgsMap,
  getNetwork,
} from './commands';
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
      lookup: () => Promise.resolve(createNamePacketQuery()),
      readFile: () => Promise.resolve(''),
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
      lookup: () => Promise.resolve(createNamePacketQuery()),
      readFile: () => Promise.resolve(''),
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
      lookup: () => Promise.resolve(createNamePacketQuery()),
      readFile: () => Promise.resolve(''),
    });
    expect(stdout).to.contains('command not found');
    expect(code).to.eql(1);
  });
  it('lookup: missing name', async () => {
    const lookup = () => Promise.resolve(createNamePacketQuery());
    const print = chai.spy();
    const code = await lookupCommand.action([], {
      lookup,
      print,
      readFile: () => Promise.resolve(''),
    });
    expect(print).to.have.been.called.with('missing name');
    expect(code).to.eql(1);
  });
  it('lookup: record not found', async () => {
    const lookup = () =>
      Promise.resolve(
        createNamePacketErrorResponse({
          rcode: ReturnCode.NXDOMAIN,
        }),
      );
    const print = chai.spy();
    const code = await lookupCommand.action(['example.com'], {
      lookup,
      print,
      readFile: () => Promise.resolve(''),
    });
    expect(print).to.have.been.called.with('Record(s) example.com not found');
    expect(code).to.eql(1);
  });
  it('lookup: specify existing network', async () => {
    const lookup = chai.spy(() =>
      Promise.resolve(createNamePacketSuccessResponse()),
    );
    const print = chai.spy();

    await lookupCommand.action(['example.com', '--network=gamma'], {
      lookup,
      print,
      readFile: () => Promise.resolve(''),
    });

    expect(lookup).to.have.been.called.with('example.com', {
      dappyNetwork: 'gamma',
    });
  });
  it('lookup: getArgsMap()', () => {
    expect(getArgsMap(['--network=gamma', '--foo=bar', '--baz'])).to.eql({
      network: 'gamma',
      foo: 'bar',
      baz: true,
    });
  });
  it('lookup: isNetworkIdArgs()', () => {
    expect(
      isNetworkIdArgs({
        network: 'gamma',
      }),
    ).to.eql(true);
  });
  it('lookup: getNetwork() using network id', async () => {
    const readFile = () => Promise.resolve('');
    expect(await getNetwork(['--network=gamma'], readFile)).to.eql('gamma');
  });
  it('lookup: getNetwork() using custom dappy-node over http', async () => {
    const readFile = () => Promise.resolve('');
    expect(
      await getNetwork(
        ['--endpoint=http://127.0.0.1:8080', '--hostname=localhost'],
        readFile,
      ),
    ).to.eql([
      {
        scheme: 'http',
        hostname: 'localhost',
        port: '8080',
        ip: '127.0.0.1',
      },
    ]);
  });

  it('lookup: getNetwork() using custom dappy-node over https', async () => {
    const caCertContent = dedent`
    -----BEGIN CERTIFICATE-----
    MIIC/DCCAeQCCQCRsoDGhEth/DANBgkqhkiG9w0BAQsFADBAMQswCQYDVQQGEwJG
    UjERMA8GA1UEBwwIVG91bG91c2UxDjAMBgNVBAoMBWRhcHB5MQ4wDAYDVQQDDAVk
    YXBweTAeFw0yMjAyMjMxNTIwMThaFw0zMjAyMjExNTIwMThaMEAxCzAJBgNVBAYT
    AkZSMREwDwYDVQQHDAhUb3Vsb3VzZTEOMAwGA1UECgwFZGFwcHkxDjAMBgNVBAMM
    BWRhcHB5MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0KiQU7LfKaZt
    Hl9hwuc0kLmz99apBbOlxiybEmQSOKYyfpRv8TB3JpGeQb2VsIeIbdDdlxz62TmW
    NEzvqzMVvAfLZSLcv3e0BmuzVKoRYlzVLVnkhH4tZ5hNwIaRBjPQgeWbdRFZQsmf
    GkKCSan11IOG9+Nb26wiQQupqXh5/DTZb5MgJv6ia4SLXAKWbrcRbHxHeI70RHVK
    ZNrAAU+Kb2PlOW9xx0heYgGOxAXbOJ+lEMjNf8E6L7aVyWjNdWXg6b9mDGMnVvG3
    zHoN8OLXiYUI5/noJaH6YYaQwaT+yc/rQ24ttpx/kpRzpoIPc4CJP6rP6GUucumP
    pkxlYC263QIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQCLcKMMr5uNcqTruz2FYPjA
    kO5sPh9QmB4HxV0vaz1mffDKJdi5MJYNRGYIjZYG0dx/amm7/R843ubAJN+qNcA7
    PkDybm0JmImcooLKN3GsLVix3ZCzmGYK5fYaqjx9fOvu3lpfVMo6QoEUMvj4E4cQ
    3jX6/QyTi8+7hoXmGbppHjJ56I2aJy8y3AqtzoHpvxRseFeO8eH1u57LiilIi3Rp
    VpScSx9ZMGEzGny+9ehbyRlf9dxpboLVUneTscmOjqqhaIWXSP9itO0cJWU3J/c5
    ArKazOtur0q566LkeIbiTqfub6V7mrhbwV34vL2OevACbuWd2fvjPzPBpSzCYlBO
    -----END CERTIFICATE-----    
    `;
    const readFile = () => Promise.resolve(caCertContent);

    expect(
      await getNetwork(
        [
          '--endpoint=https://127.0.0.1',
          '--hostname=localhost',
          '--cacert=./cacert.pem',
        ],
        readFile,
      ),
    ).to.eql([
      {
        scheme: 'https',
        hostname: 'localhost',
        port: '443',
        ip: '127.0.0.1',
        caCert: Buffer.from(caCertContent, 'utf8').toString('base64'),
      },
    ]);
  });
  it('lookup: getNetwork() using custom network file (1 member)', async () => {
    const customNetworkMember = getFakeDappyNetworkMember();
    const readFile = () => Promise.resolve(JSON.stringify(customNetworkMember));

    expect(await getNetwork(['--network-file=./custom.json'], readFile)).to.eql(
      [customNetworkMember],
    );
  });
  it('lookup: getNetwork() using custom network file (3 members)', async () => {
    const customNetworkMember = getFakeDappyNetworkMember();
    const readFile = () =>
      Promise.resolve(
        JSON.stringify([
          customNetworkMember,
          customNetworkMember,
          customNetworkMember,
        ]),
      );

    expect(await getNetwork(['--network-file=./custom.json'], readFile)).to.eql(
      [customNetworkMember, customNetworkMember, customNetworkMember],
    );
  });
  it('lookup: getNetwork() using custom network file that fail to load', async () => {
    const readFile = () => Promise.reject(new Error('File not found'));

    let error;
    try {
      await getNetwork(['--network-file=./custom.json'], readFile);
    } catch (e) {
      error = e;
    } finally {
      expect((error as Error).message).to.eql('File not found');
    }
  });
});
