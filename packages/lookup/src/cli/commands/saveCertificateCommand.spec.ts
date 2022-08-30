import chai, { expect } from 'chai';
import spies from 'chai-spies';
import {
  createCertNamePacketSuccessResponse,
  fakeCertificate,
} from '../../model/fakeData';
import { RecordType } from '../../model/ResourceRecords';
import { saveCertificateCommand } from './saveCertificateCommand';

chai.use(spies);

describe('cli command: savecertificate', () => {
  it('save 1 certificate as file', async () => {
    const fakeWriteFile = chai.spy(() => Promise.resolve());
    const r = await saveCertificateCommand.action(['example'], {
      lookup: chai.spy(() =>
        Promise.resolve(createCertNamePacketSuccessResponse()),
      ),
      print: chai.spy(),
      readFile: chai.spy(() => Promise.resolve('')),
      writeFile: fakeWriteFile,
    });
    expect(fakeWriteFile).to.have.been.called.with(
      'example.pem',
      fakeCertificate,
    );
    expect(r).to.eql(0);
  });
  it('save 2 certificates as files', async () => {
    const fakeWriteFile = chai.spy(() => Promise.resolve());
    const r = await saveCertificateCommand.action(['example'], {
      lookup: chai.spy(() =>
        Promise.resolve(
          createCertNamePacketSuccessResponse({
            answers: [
              {
                name: 'example',
                type: RecordType.CERT,
                class: 'IN',
                ttl: 60,
                data: fakeCertificate,
              },
              {
                name: 'example',
                type: RecordType.CERT,
                class: 'IN',
                ttl: 60,
                data: fakeCertificate,
              },
            ],
          }),
        ),
      ),
      print: chai.spy(),
      readFile: chai.spy(() => Promise.resolve('')),
      writeFile: fakeWriteFile,
    });
    expect(fakeWriteFile).to.have.been.first.called.with(
      'example-1.pem',
      fakeCertificate,
    );
    expect(fakeWriteFile).to.have.been.second.called.with(
      'example-2.pem',
      fakeCertificate,
    );
    expect(r).to.eql(0);
  });
  it('save 1 certificate as file with --out', async () => {
    const fakeWriteFile = chai.spy(() => Promise.resolve());
    const r = await saveCertificateCommand.action(
      ['example', '--out=toto.pem'],
      {
        lookup: chai.spy(() =>
          Promise.resolve(createCertNamePacketSuccessResponse()),
        ),
        print: chai.spy(),
        readFile: chai.spy(() => Promise.resolve('')),
        writeFile: fakeWriteFile,
      },
    );
    expect(fakeWriteFile).to.have.been.called.with('toto.pem', fakeCertificate);
    expect(r).to.eql(0);
  });
  it('save 2 certificates as files with --out', async () => {
    const fakeWriteFile = chai.spy(() => Promise.resolve());
    const r = await saveCertificateCommand.action(['example', '--out=foo'], {
      lookup: chai.spy(() =>
        Promise.resolve(
          createCertNamePacketSuccessResponse({
            answers: [
              {
                name: 'example',
                type: RecordType.CERT,
                class: 'IN',
                ttl: 60,
                data: fakeCertificate,
              },
              {
                name: 'example',
                type: RecordType.CERT,
                class: 'IN',
                ttl: 60,
                data: fakeCertificate,
              },
            ],
          }),
        ),
      ),
      print: chai.spy(),
      readFile: chai.spy(() => Promise.resolve('')),
      writeFile: fakeWriteFile,
    });
    expect(fakeWriteFile).to.have.been.first.called.with(
      'foo-1.pem',
      fakeCertificate,
    );
    expect(fakeWriteFile).to.have.been.second.called.with(
      'foo-2.pem',
      fakeCertificate,
    );
    expect(r).to.eql(0);
  });
  it('missing name', async () => {
    const fakePrint = chai.spy();
    const r = await saveCertificateCommand.action([], {
      lookup: chai.spy(() =>
        Promise.resolve(createCertNamePacketSuccessResponse()),
      ),
      readFile: chai.spy(() => Promise.resolve('')),
      writeFile: chai.spy(() => Promise.resolve()),
      print: fakePrint,
    });

    expect(r).to.eql(1);
    expect(fakePrint).to.have.been.called.with('missing name');
  });
  it('no answer', async () => {
    const fakeWriteFile = chai.spy(() => Promise.resolve());
    const print = chai.spy();
    const r = await saveCertificateCommand.action(['example'], {
      lookup: chai.spy(() =>
        Promise.resolve(
          createCertNamePacketSuccessResponse({
            answers: [],
          }),
        ),
      ),
      print,
      readFile: chai.spy(() => Promise.resolve('')),
      writeFile: fakeWriteFile,
    });
    expect(print).to.have.been.called.with('Certificate(s) example not found');
    expect(r).to.eql(1);
  });
});
