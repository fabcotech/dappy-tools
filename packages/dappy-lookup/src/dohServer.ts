import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import https from 'https';
import fs from 'fs';
import dnsPacket from 'dns-packet';
import { DappyDohServerOptions } from './types';
import { lookup } from './lookup';

const hasDnsQuery = (
  packet: dnsPacket.Packet,
): packet is dnsPacket.Packet & { questions: dnsPacket.Question[] } => {
  return !!(packet.questions && packet.questions.length > 0);
};

const hasDnsAnswer = (
  packet: dnsPacket.Packet,
): packet is dnsPacket.Packet & { answers: dnsPacket.StringAnswer[] } => {
  return !!(packet.answers && packet.answers.length > 0);
};

const dnsErrorPacket = (packet: dnsPacket.Packet) => {
  const error = {
    rcode: 'SERVFAIL',
    flags: 2,
    type: 'response' as const,
    id: packet.id || 0,
    questions: undefined,
    answers: [],
    additionals: [],
    authorities: [],
  };
  return dnsPacket.encode(error);
};

const getResponseData = (response: dnsPacket.Packet) => {
  if (!hasDnsAnswer(response)) {
    return undefined;
  }
  return response.answers[0].data;
};

const dnsQuery =
  (print: (str: string) => void, options: DappyDohServerOptions) =>
  async (req: Request, res: Response) => {
    res.set({
      'content-type': 'application/dns-message',
      'Access-Control-Allow-Origin': '*',
    });

    const queryPacket = dnsPacket.decode(req.body);

    if (!hasDnsQuery(queryPacket)) {
      res.send(dnsErrorPacket(queryPacket));
      return;
    }

    const question = queryPacket.questions[0];
    let dnsResponse;

    try {
      dnsResponse = await lookup(question.name, question.type, {
        dappyNetwork: options.dappyNetwork,
      });
    } catch (err) {
      res.send(dnsErrorPacket(queryPacket));
      return;
    }

    const d = new Date();
    print(
      `[${d.toLocaleDateString()} ${d.toLocaleTimeString()}] name: ${
        question.name
      }, record type: ${question.type}, response: ${getResponseData(
        dnsResponse as dnsPacket.Packet,
      )}`,
    );

    res.send(dnsPacket.encode(dnsResponse as dnsPacket.Packet));
  };

const start =
  (options: DappyDohServerOptions, print: (str: string) => void) => () => {
    return new Promise((resolve, reject) => {
      const app = express();

      const server = https.createServer(
        {
          key: fs.readFileSync(options.key || 'server.key'),
          cert: fs.readFileSync(options.cert || 'server.crt'),
          minVersion: 'TLSv1.3',
          ciphers: 'TLS_AES_256_GCM_SHA384',
        },
        app,
      );

      server.on('tlsClientError', (error, socket) => {
        const { remoteAddress } = socket;
        print(`tlsClientError ${remoteAddress}. Details: ${error.message}`);
      });

      server.on('close', () => reject());

      app.use(
        '/dns-query',
        bodyParser.raw({ type: 'application/dns-message' }),
      );

      app.post('/dns-query', dnsQuery(print, options));

      server.listen(options.port, () => {
        print(`dohServer started on port ${options.port}`);
      });
    });
  };

export function dohServer(
  options: DappyDohServerOptions,
  print: (str: string) => void,
) {
  return {
    start: start(options, print),
  };
}
