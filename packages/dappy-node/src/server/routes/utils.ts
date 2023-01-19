import { NameZone, RR } from '@fabcotech/dappy-lookup';

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
  appendSuffixDappy = false
): RR[] =>
  records.map((record) => ({
    ...record,
    name:
      getRecordName(record.name, zone.origin) +
      (appendSuffixDappy ? `.${suffix}` : ''),
    ttl: record.ttl || zone.ttl,
  }));

/*
  Based on a name that is looked up, with what
  host should we match it ?
*/
export const recordHostsToMatchWith = (name: string): string[] => {
  const levels = (name.match(/\./g) || []).length;
  // example
  if (levels === 0) {
    return ['@', '*'];
  }

  const matchLvl1 = name.split('.').slice(0, 1).join('.');
  // japan.example
  if (levels === 1) {
    return [matchLvl1, '*'];
  }

  const matchLvl2 = `*.${name.split('.').slice(1, 2).join('.')}`;
  // north.japan.example
  if (levels === 2) {
    return [matchLvl2, '*'];
  }

  return [matchLvl2, '*'];
};
