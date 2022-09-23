import { DappyNetworkMember, dappyNetworks } from '@fabcotech/dappy-lookup';
import chai from 'chai';
import spies from 'chai-spies';
import { loadDappyNetwork } from './config';

const { expect } = chai;
chai.use(spies);

describe('config', () => {
  describe('loadDappyNetwork', () => {
    it('should return undefined if no network is defined', () => {
      const network = loadDappyNetwork(
        undefined,
        undefined,
        dappyNetworks,
        undefined
      );
      expect(network).to.equal(undefined);
    });
    it('should throw an error if custom network is defined and not self hostname', () => {
      const customNetwork = [
        {
          hostname: 'node1',
          ip: '127.0.0.1',
          port: '3001',
          scheme: 'http',
        },
      ] as DappyNetworkMember[];

      expect(() =>
        loadDappyNetwork(undefined, customNetwork, dappyNetworks, undefined)
      ).throw();
    });
    it('should throw an error if network id is defined and not self hostname', () => {
      expect(() =>
        loadDappyNetwork('gamma', undefined, dappyNetworks, undefined)
      ).throw();
    });
    it('should return custom network if self hostname defined', () => {
      const customNetwork = [
        {
          hostname: 'node1',
          ip: '127.0.0.1',
          port: '3001',
          scheme: 'http',
        },
      ] as DappyNetworkMember[];

      expect(
        loadDappyNetwork(undefined, customNetwork, dappyNetworks, 'node1')
      ).to.equal(customNetwork);
    });
    it('should return dappy network if self hostname defined', () => {
      const networks = {
        gamma: [
          {
            hostname: 'node1',
            ip: '127.0.0.1',
            port: '3001',
            scheme: 'http',
          },
        ] as DappyNetworkMember[],
      };
      expect(loadDappyNetwork('gamma', undefined, networks, 'node1')).to.equal(
        networks.gamma
      );
    });
  });
});
