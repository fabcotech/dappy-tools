import { dappyNetworks, DappyNetworkMemberHTTP } from '@fabcotech/dappy-lookup';
import chai from 'chai';
import spies from 'chai-spies';
import { loadDappyNetwork } from './config';

const { expect } = chai;
chai.use(spies);

describe('config', () => {
  describe('loadDappyNetwork', () => {
    it('should return [] if no network is defined', () => {
      const network = loadDappyNetwork(undefined, [], dappyNetworks);
      expect(network).to.eql([]);
    });
    it('should return custom network', () => {
      const customNetwork = [
        {
          hostname: 'node1',
          ip: '127.0.0.1',
          port: '3001',
          scheme: 'http',
        },
      ] as DappyNetworkMemberHTTP[];

      expect(
        loadDappyNetwork(undefined, customNetwork, dappyNetworks)
      ).to.equal(customNetwork);
    });
    it('should return dappy network', () => {
      const networks = {
        gamma: [
          {
            hostname: 'node1',
            ip: '127.0.0.1',
            port: '3001',
            scheme: 'http',
          },
        ] as DappyNetworkMemberHTTP[],
      };
      expect(loadDappyNetwork('gamma', [], networks)).to.equal(
        networks.gamma
      );
    });
  });
});
