import express from 'express';
import bodyParser from 'body-parser';
import https from 'https';
import dnsPacket from 'dns-packet';
import { DappyDohServerOptions } from './types';
import { lookup } from './lookup';

type Api = {
  lookup: typeof lookup;
  print: (str: string) => void;
  readFile(path: string): Promise<string>;
};

export const hasDnsQuery = (
  packet: dnsPacket.Packet,
): packet is dnsPacket.Packet & { questions: dnsPacket.Question[] } => {
  return !!(packet.questions && packet.questions.length > 0);
};

export const hasDnsAnswer = (
  packet: dnsPacket.Packet,
): packet is dnsPacket.Packet & { answers: dnsPacket.StringAnswer[] } => {
  return !!(packet.answers && packet.answers.length > 0);
};

export const dnsErrorPacket = (packet: dnsPacket.Packet) => {
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

export const getResponseData = (response: dnsPacket.Packet) => {
  if (!hasDnsAnswer(response)) {
    return undefined;
  }
  return response.answers[0].data;
};

export const dnsQuery =
  (api: Api, options: DappyDohServerOptions) => async (body: Buffer) => {
    const queryPacket = dnsPacket.decode(body);

    if (!hasDnsQuery(queryPacket)) {
      return dnsErrorPacket(queryPacket);
    }

    const question = queryPacket.questions[0];
    let dnsResponse;

    try {
      dnsResponse = await api.lookup(question.name, question.type, {
        dappyNetwork: options.dappyNetwork,
      });
    } catch (err) {
      return dnsErrorPacket(queryPacket);
    }

    const d = new Date();
    api.print(
      `[${d.toLocaleDateString()} ${d.toLocaleTimeString()}] name: ${
        question.name
      }, record type: ${question.type}, response: ${getResponseData(
        dnsResponse as dnsPacket.Packet,
      )}`,
    );

    return dnsPacket.encode(dnsResponse as dnsPacket.Packet);
  };

const start = (options: DappyDohServerOptions, api: Api) => async () => {
  const app = express();

  const server = https.createServer(
    {
      key: await api.readFile(options.key || 'server.key'),
      cert: await api.readFile(options.cert || 'server.crt'),
      minVersion: 'TLSv1.3',
      ciphers: 'TLS_AES_256_GCM_SHA384',
    },
    app,
  );

  server.on('tlsClientError', (error, socket) => {
    const { remoteAddress } = socket;
    api.print(`tlsClientError ${remoteAddress}. Details: ${error.message}`);
  });

  app.use('/dns-query', bodyParser.raw({ type: 'application/dns-message' }));

  app.post('/dns-query', async (req, res) => {
    res.set({
      'content-type': 'application/dns-message',
      'Access-Control-Allow-Origin': '*',
    });

    const r = await dnsQuery(api, options)(req.body);
    res.send(r);
  });

  server.listen(options.port, () => {
    api.print(`dohServer started on port ${options.port}`);
  });

  return new Promise(() => {});
};

export function dohServer(options: DappyDohServerOptions, api: Api) {
  return {
    start: start(options, api),
  };
}
