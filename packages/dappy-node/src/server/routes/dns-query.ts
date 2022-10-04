import dnsPacket, { Packet } from 'dns-packet';
import { Request, Response } from 'express';

import {
  isNameZone,
  NameZone,
  NameAnswer,
  NamePacket,
  NameQuestion,
} from '@fabcotech/dappy-lookup';
import { getTLDs, normalizeRecords } from './utils';

const compliantDNSRecordTypes = ['A', 'AAAA', 'TXT', 'CNAME'];

const isCompliantDNSRecordType = (type: string) =>
  compliantDNSRecordTypes.includes(type);

export const getZoneRecords = (
  questions: NameQuestion[],
  zones: NameZone[],
  dappyNetworkId: string
): NameAnswer[] =>
  questions
    .map(({ type, name }) => {
      const records = zones
        .map((zone) =>
          normalizeRecords(
            zone,
            zone.records,
            dappyNetworkId,
            new RegExp(`.${dappyNetworkId}`).test(name)
          )
        )
        .flat();
      return records.filter(
        (record) => record.type === type && record.name === name
      );
    })
    .flat()
    .map(
      (record) =>
        ({
          type: record.type,
          class: 'IN',
          name: record.name,
          ttl: record.ttl,
          data: record.data,
        } as any)
    );

const isNameZones = (zones: any[]): zones is NameZone[] => {
  if (!Array.isArray(zones) || zones.length === 0) {
    return false;
  }
  return zones.every((zone) => isNameZone(zone));
};

export const createFetchNameAnswers =
  (
    getZonesApi: (names: string[]) => Promise<NameZone[]>,
    dappyNetworkId: string
  ) =>
  async (packet: NamePacket): Promise<NamePacket> => {
    if (!packet.questions || packet.questions.length === 0) {
      return {
        version: '1.0.0',
        rcode: 'NXDOMAIN',
        flags: 3,
        type: 'response',
        id: packet.id || 0,
        questions: [],
        answers: [],
        additionals: [],
        authorities: [],
      };
    }

    let tldZones: NameZone[];
    try {
      tldZones = await getZonesApi(
        getTLDs(
          packet.questions.map((q) => q.name),
          dappyNetworkId
        )
      );
    } catch (e) {
      return {
        version: '1.0.0',
        rcode: 'SERVFAIL',
        flags: 2,
        type: 'response',
        id: packet.id || 0,
        questions: packet.questions,
        answers: [],
        additionals: [],
        authorities: [],
      };
    }

    if (!isNameZones(tldZones)) {
      return {
        version: '1.0.0',
        rcode: 'NOTZONE',
        flags: 9,
        type: 'response',
        id: packet.id || 0,
        questions: packet.questions,
        answers: [],
        additionals: [],
        authorities: [],
      };
    }

    const answers = getZoneRecords(packet.questions, tldZones, dappyNetworkId);

    return {
      version: '1.0.0',
      type: 'response',
      flags: answers.length === 0 ? 3 : 0,
      rcode: answers.length === 0 ? 'NXDOMAIN' : 'NOERROR',
      id: packet.id || 0,
      questions: packet.questions,
      answers,
      additionals: [],
      authorities: [],
    };
  };

export const createDnsQuery =
  (
    getZones: (names: string[]) => Promise<NameZone[]>,
    dappyNetworkId: string
  ) =>
  async (req: Request, res: Response) => {
    res.set({
      'content-type': 'application/dns-message',
      'Access-Control-Allow-Origin': '*',
    });

    const queryPacket = dnsPacket.decode(req.body);
    const withoutNonCompliantDNSRecordTypes = {
      ...queryPacket,
      questions: (queryPacket.questions || []).filter((q) =>
        isCompliantDNSRecordType(q.type)
      ),
    };
    const response = await createFetchNameAnswers(
      getZones,
      dappyNetworkId
    )(withoutNonCompliantDNSRecordTypes as NamePacket);

    res.send(dnsPacket.encode(response as Packet));
  };

export const createExtendedDnsQuery =
  (
    getZones: (names: string[]) => Promise<NameZone[]>,
    dappyNetworkId: string
  ) =>
  async (req: Request, res: Response) => {
    res.set({
      'content-type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });

    const queryPacket = req.body;
    const response = await createFetchNameAnswers(
      getZones,
      dappyNetworkId
    )(queryPacket as NamePacket);

    res.send(response);
  };
