

import elliptic from 'elliptic';
import { blake2b }  from 'blakejs';

export { gossip } from './gossip';

// https://www.tabnine.com/code/javascript/modules/elliptic

const ec = new elliptic.ec('secp256k1');

export const publicKeyFromPrivateKey = (privateKey: string) => {
  return Buffer.from(
    ec.keyFromPrivate(new Uint8Array(Buffer.from(privateKey)))
    .getPublic()
    .encode('array', false)
  ).toString('hex')
};

const signSecp256k1 = (hash: Uint8Array, privateKey: Uint8Array): Uint8Array => {
  const keyPair = ec.keyFromPrivate(privateKey);
  const signature = keyPair.sign(Buffer.from(hash), { canonical: true });
  const derSign = signature.toDER();

  if (
    !ec.verify(
      Buffer.from(hash),
      Buffer.from(derSign),
      Buffer.from(keyPair.getPublic().encode('array', false)),
      'hex'
    )
  ) {
    throw new Error('Signature verification failed');
  }

  return new Uint8Array(derSign);
};

const verify = (hash: Uint8Array, publicKey: string, signature: string): boolean => {
  let key = ec.keyFromPublic(publicKey, 'hex');
  let verified = key.verify(hash, signature);
  return verified;
};

const getBlake2Hash = (a: Uint8Array, length: number) => blake2b(a, new Uint8Array(), length);

export const signZoneTransaction = (data: any, privateKey: string, format: 'uint8array' | 'hex') => {
  if (!['uint8array', 'hex'].includes(format)) {
    throw new Error('Unknown format')
  }
  const toSign = new Uint8Array(Buffer.from(JSON.stringify(data)));
  const blake2Hash64 = getBlake2Hash(toSign, 64);
  const signature = signSecp256k1(blake2Hash64, new Uint8Array(Buffer.from(privateKey)));

  if (format === 'uint8array') {
    return signature;
  } else {
    return Buffer.from(signature).toString('hex')
  }
}

export const checkZoneTransaction = (
  publicKey: string,
  zoneTransactionWithSignature: {
    data: {
      zone: {},
      date: number
    },
    signature: string
  },
  ignoreDate = false
) => {
  if (ignoreDate === true) {
    console.warn('You should not ignore date, make sure you are in a test environment')
  }
  if (ignoreDate === false) {
    const date = zoneTransactionWithSignature.data.date;
    if (
      // not in future
      date > new Date().getTime() ||
      // not older than 10minutes
      date < (new Date().getTime() - (1000 * 60 * 10))
    ) {
      throw new Error('Invalid date')
    }
  }

  const payload = new Uint8Array(Buffer.from(JSON.stringify(zoneTransactionWithSignature.data)));
  const blake2Hash64 = getBlake2Hash(payload, 64);

  if (verify(
    blake2Hash64,
    publicKey,
    zoneTransactionWithSignature.signature
  )) {
    return true
  }

  throw new Error('Cannot validate payload');
}