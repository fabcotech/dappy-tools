import chai, { expect } from 'chai';
import spies from 'chai-spies';
import {
  createCertNamePacketSuccessResponse,
  fakeCertificate,
} from '../../model';
import { saveCertificateCommand } from './saveCertificateCommand';
import { fakeApi, fakeDoHServer } from '../utils/test.spec';

chai.use(spies);

describe('cli command: savecertificate', () => {
  it('save 1 certificate as file', async () => {
    const api = fakeApi({
      lookup: chai.spy(() =>
        Promise.resolve(createCertNamePacketSuccessResponse()),
      ),
    });
    const r = await saveCertificateCommand.action(['example'], api);
    expect(api.writeFile).to.have.been.called.with(
      'example.pem',
      fakeCertificate,
    );
    expect(r).to.eql(0);
  });
  it('save 2 certificates as files', async () => {
    const api = fakeApi({
      lookup: chai.spy(() =>
        Promise.resolve(
          createCertNamePacketSuccessResponse({
            answers: [
              {
                name: 'example',
                type: 'CERT',
                class: 'IN',
                ttl: 60,
                data: fakeCertificate,
              },
              {
                name: 'example',
                type: 'CERT',
                class: 'IN',
                ttl: 60,
                data: fakeCertificate,
              },
            ],
          }),
        ),
      ),
    });
    const r = await saveCertificateCommand.action(['example'], api);
    expect(api.writeFile).to.have.been.first.called.with(
      'example-1.pem',
      fakeCertificate,
    );
    expect(api.writeFile).to.have.been.second.called.with(
      'example-2.pem',
      fakeCertificate,
    );
    expect(r).to.eql(0);
  });
  it('save 1 certificate as file with --out', async () => {
    const api = fakeApi({
      lookup: chai.spy(() =>
        Promise.resolve(createCertNamePacketSuccessResponse()),
      ),
    });
    const r = await saveCertificateCommand.action(
      ['example', '--out=toto.pem'],
      api,
    );
    expect(api.writeFile).to.have.been.called.with('toto.pem', fakeCertificate);
    expect(r).to.eql(0);
  });
  it('save 2 certificates as files with --out', async () => {
    const api = fakeApi({
      lookup: chai.spy(() =>
        Promise.resolve(
          createCertNamePacketSuccessResponse({
            answers: [
              {
                name: 'example',
                type: 'CERT',
                class: 'IN',
                ttl: 60,
                data: fakeCertificate,
              },
              {
                name: 'example',
                type: 'CERT',
                class: 'IN',
                ttl: 60,
                data: fakeCertificate,
              },
            ],
          }),
        ),
      ),
    });
    const r = await saveCertificateCommand.action(
      ['example', '--out=foo'],
      api,
    );
    expect(api.writeFile).to.have.been.first.called.with(
      'foo-1.pem',
      fakeCertificate,
    );
    expect(api.writeFile).to.have.been.second.called.with(
      'foo-2.pem',
      fakeCertificate,
    );
    expect(r).to.eql(0);
  });
  it('missing name', async () => {
    const api = fakeApi({
      lookup: chai.spy(() =>
        Promise.resolve(createCertNamePacketSuccessResponse()),
      ),
    });

    const r = await saveCertificateCommand.action([], api);

    expect(r).to.eql(1);
    expect(api.print).to.have.been.called.with('missing name');
  });
  it('no answer', async () => {
    const fakeWriteFile = chai.spy(() => Promise.resolve());
    const print = chai.spy();
    const r = await saveCertificateCommand.action(['example'], {
      lookup: chai.spy(() => {
        const res = createCertNamePacketSuccessResponse();
        res.answers = [];
        return Promise.resolve(res);
      }),
      dohServer: fakeDoHServer(),
      print,
      readFile: chai.spy(() => Promise.resolve('')),
      writeFile: fakeWriteFile,
    });
    expect(print).to.have.been.called.with('Certificate(s) example not found');
    expect(r).to.eql(1);
  });
});
