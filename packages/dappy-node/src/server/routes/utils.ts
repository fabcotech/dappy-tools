import { NameZone } from '../../model/NameZone';
import { RR } from '../../model/ResourceRecords';

export const getTLDs = (names: string[], dappyNetworkId: string): string[] => {
  // hello.d -> hello
  const nn = names.map((name) => {
    if (name.endsWith(`.${dappyNetworkId}`)) {
      return name.slice(0, name.length - `.${dappyNetworkId}`.length);
    }
    return name;
  });

  // bar.foo.hello -> hello
  return nn.map((name) => name.split('.').slice(-1)[0]);
};

export const getRecordName = (
  recordName: string,
  zoneOrigin: string
): string => {
  switch (recordName) {
    case '@':
    case '':
    case undefined:
      return zoneOrigin;
    default:
      return `${recordName}.${zoneOrigin}`;
  }
};

export const normalizeRecords = (
  zone: NameZone,
  records: RR[],
  suffix: string,
  appendSuffixDappy = false,
): RR[] =>
  records.map((record) => ({
    ...record,
    name:
      getRecordName(record.name, zone.origin) + (appendSuffixDappy ? `.${suffix}` : ''),
    ttl: record.ttl || zone.ttl,
  }));
