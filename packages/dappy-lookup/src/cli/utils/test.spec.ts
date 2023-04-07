import chai from 'chai';
import mergeDeep from 'lodash.merge';
import { Api } from '../api';
import { createNamePacketQuery } from '../../model';

export const fakeDoHServer = () =>
  chai.spy(() => ({ start: () => Promise.resolve() }));

export const fakeApi = (api: Partial<Api> = {}): Api =>
  mergeDeep(
    {
      print: chai.spy(() => Promise.resolve(createNamePacketQuery())),
      lookup: chai.spy(() => Promise.resolve(createNamePacketQuery())),
      dohServer: chai.spy(() => fakeDoHServer()),
      readFile: chai.spy(() => Promise.resolve('')),
      writeFile: chai.spy(() => Promise.resolve()),
    },
    api,
  );
