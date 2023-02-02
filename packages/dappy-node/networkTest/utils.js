const https = require('https');
const fs = require('fs');
const { publicKeyFromPrivateKey, checkZoneTransaction, signZoneTransaction } = require('@fabcotech/gossip');

const charactersaz = "a,z,e,r,t,y,u,i,o,p,q,s,d,f,g,h,j,k,l,m,w,x,c,v,b,n".split(',');
const charactersaz09 = charactersaz.concat('0,1,2,3,4,5,6,7,8,9'.split(','));
module.exports.getRandomName = (onlyaz = false) => {
  let name = '';
  for (let i = 0; i < 9; i += 1) {
    name += charactersaz09[Math.floor(Math.random() * 36)];
  }
  return name;
};

module.exports.getZones = async (dappyNetwork, origins) => {
  const results = await new Promise((resolve, reject) => {
    const dnm = dappyNetwork[0];
    
    const options = {
      minVersion: 'TLSv1.3',
      rejectUnauthorized: true,
      ca: Buffer.from(dnm.caCert, "base64").toString("utf8"),
      host: dnm.ip,
      method: 'POST',
      port: dnm.port,
      path: `/get-zones`,
      headers: {
        'Content-Type': 'application/json',
        Host: dnm.hostname,
      },
    };
    const req = https.request(options, (res) => {
    //const req = http.request(options, (res) => {
      if (res.statusCode !== 200) {
        reject(`Status code not 200 : ${res.statusCode}`);
        return;
      }
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    });
    req.on('error', err => {
      reject(err)
    });
    req.end(JSON.stringify(origins))
  });

  return JSON.parse(results).result;
};

module.exports.getZonesPaginated = async (dappyNetwork, a) => {
  const results = await new Promise((resolve, reject) => {
    const dnm = dappyNetwork[0];
    
    const options = {
      minVersion: 'TLSv1.3',
      rejectUnauthorized: true,
      ca: Buffer.from(dnm.caCert, "base64").toString("utf8"),
      host: dnm.ip,
      method: 'POST',
      port: dnm.port,
      path: `/get-zones-paginated`,
      headers: {
        'Content-Type': 'application/json',
        Host: dnm.hostname,
      },
    };
    const req = https.request(options, (res) => {
    //const req = http.request(options, (res) => {
      if (res.statusCode !== 200) {
        reject(`Status code not 200 : ${res.statusCode}`);
        return;
      }
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    });
    req.on('error', err => {
      reject(err)
    });
    req.end(JSON.stringify(a))
  });

  return JSON.parse(results).result;
};

module.exports.purchaseZone = async (dappyNetwork, zone, privateKey, neww = false) => {
    const result = await new Promise((resolve, reject) => {
      const dnm = dappyNetwork[0];
      const options = {
        minVersion: 'TLSv1.3',
        rejectUnauthorized: true,
        ca: Buffer.from(dnm.caCert, "base64").toString("utf8"),
        host: dnm.ip,
        method: 'POST',
        port: dnm.port,
        path: `/gossip`,
        headers: {
          'Content-Type': 'application/json',
          Host: dnm.hostname,
        },
      };
      const req = https.request(options, (res) => {
        if (res.statusCode !== 200) {
          reject(`Status code not 200 : ${res.statusCode}`);
          return;
        }
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve(data);
        });
      });
      req.on('error', err => {
        reject(err)
      });
  
      const data = {
        zone: zone,
        date: new Date().getTime(),
        ...(neww ? { new: true } : {})
      };
  
      const signature = signZoneTransaction(
        data,
        privateKey,
        'hex'
      );
  
      const publicKey = publicKeyFromPrivateKey(privateKey);
  
      checkZoneTransaction(
        publicKey,
        {
          data: data,
          signature: signature
        }
      );
  
      req.end(JSON.stringify(
        {
          data: data,
          signature: signature
        }
      ));
    });
    return result;
  }

module.exports.getHash = async (dnm) => {
  return new Promise((resolve, reject) => {
    const options = {
      minVersion: 'TLSv1.3',
      rejectUnauthorized: true,
      host: dnm.ip,
      method: 'GET',
      ca: Buffer.from(dnm.caCert, 'base64').toString('utf8'),
      port: dnm.port,
      path: '/hash',
      headers: {
        'Content-Type': 'application/json',
        Host: dnm.hostname,
      },
    };

    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Status code not 200 : ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    });
    req.on('error', (err) => {
      reject(err);
    });
    req.end();
  });
};

module.exports.writeCerts = () => {
  fs.writeFileSync(
    './networkTest/dappynodetest1.crt',
  `-----BEGIN CERTIFICATE-----
MIICzjCCAbagAwIBAgIUfgMwuRmki5hMEOiYK9f9SBzHAbEwDQYJKoZIhvcNAQEL
BQAwFDESMBAGA1UEAwwJbG9jYWxob3N0MB4XDTIyMDQyODA4NDczMVoXDTQyMDQy
MzA4NDczMVowFDESMBAGA1UEAwwJbG9jYWxob3N0MIIBIjANBgkqhkiG9w0BAQEF
AAOCAQ8AMIIBCgKCAQEArZkjQZm8KuNnjBcNHAoMA2PDjLXmtuQ9WHPqO/Po2BmV
BICeONu+swPRl4dTxBg78DCms/+HdqUG3fxk3wlH8LwgUBipVmQoSzmZS0Cl+bx8
QLsMkd3jljUZzC2HbYPtzC+oJ2eQCl36VCxCgYF6CWl6AdK+bOVIJ7ax4XdWBPqg
g6QIXc1QX/e7f57+32OJ/9vUufCqnT2JMcB3009SQnQAfoWhlCipnMrWShRxCOTh
t8Bl1qdIi1ZxQsL+wWP29E5r18ArnZJvltKG5zFnzuBkiUlmvqLb556U88hWbBtR
4rN/XZlNIYBGjKbZRlkeFevMmho31zpmGb03bqHG7QIDAQABoxgwFjAUBgNVHREE
DTALgglsb2NhbGhvc3QwDQYJKoZIhvcNAQELBQADggEBAK04/MQs2nu5fSripeH4
Cguye/jTA5HmvTOeOirh9g4XMuwo3pBIbZ5FgmhWWPvosMHfqZZBG1HlBZypfOiN
dSOj8Gn8MdgDfoPGtV5mRSwBrWJiPIILKS0aSepH5MAqRGftJjjs1bqkrZbReNCd
SbLvpPsAs9CUCIfXxoz2XmBTq6w3XKNFrMEUB6fcHKKWmU3pm2OYjPlJVl6QThIO
CK9j8cKxqCXDHdj5m731xlBQpMiJt+kyMYbOPVlJz/mrs5BI5YQRa1/4AEMNFN/m
R+ueMXCzw3/aX6dWBYnDm/pl/hhtWvYeASgEawHYMhqyJORyTx6IXDcPgj/OB8HP
EZw=
-----END CERTIFICATE-----`,
    'utf8'
  );
  fs.writeFileSync(
    './networkTest/dappynodetest1.key',
`-----BEGIN RSA PRIVATE KEY-----
MIIEpQIBAAKCAQEArZkjQZm8KuNnjBcNHAoMA2PDjLXmtuQ9WHPqO/Po2BmVBICe
ONu+swPRl4dTxBg78DCms/+HdqUG3fxk3wlH8LwgUBipVmQoSzmZS0Cl+bx8QLsM
kd3jljUZzC2HbYPtzC+oJ2eQCl36VCxCgYF6CWl6AdK+bOVIJ7ax4XdWBPqgg6QI
Xc1QX/e7f57+32OJ/9vUufCqnT2JMcB3009SQnQAfoWhlCipnMrWShRxCOTht8Bl
1qdIi1ZxQsL+wWP29E5r18ArnZJvltKG5zFnzuBkiUlmvqLb556U88hWbBtR4rN/
XZlNIYBGjKbZRlkeFevMmho31zpmGb03bqHG7QIDAQABAoIBABX/rwEUK01ADhIp
paak+0q+rLw7HOaWW9PGtKsuSJaB/2lXpzVLW4ox9LCAHLRf4dCZSbbLre3yEcG1
x06gTXaLUIj15xekj5qgzPVFVwMjyJcnXPtrI/kX95HxPxU4v7y9WVDNBeraZ+uc
xDzHHKDuteBfRXRlRdSKiVYqGkN9DbCh1E3wCKYVhyC+xF1Zq2NbwAqUWsASjOZc
7ES2pD9tO2d2k15tLfP5EDfXZXyXT0ypv9XOJxJfM43W40ITE07RxoDnK4/TycL3
sxUwOrMN4K/oBeqDl+YKrDVz2WYMS2htJo7wKj343t6MTdANqoCmfS/UvcGvFXVD
X7UgSj0CgYEA3wFLTHz0h3w08AF21hQbrGsiemHjVuMqtj9uW5KwY6QbGzCOA2v2
v/wSTRnsb7016iNBOqelVqH/XVutqbm/N+TEaiZTEq/dgD0nL6zlg9/neHiHrT85
47T0YOvR1n6/kPMBa3sKbZbRSJbY1lO+E+uq+YjL9GKzZhle/deFsKcCgYEAx0h4
8qFePPECmIAKWS911VmRJSFTaZlruT3JCzevNXOrwgzlj0TArnCCpfNZzs4UIzKw
Ki4dMqiB1YMS9KRQ1FVDIWQQ4tTCO64Vj7uolYGmWbdIAL+Cipidnncdh0wndfK6
5N/aopDoHYMJ5Jrk8MFy+0DW+/WYgQ3f3/97iksCgYEAzjyDJ8Sz3IzI5GFmRouo
ICegZjAbMGK8QHmfFP8vM6c0Dkw0OgPh2iFDx5w+5gPFVbiu/ZDHPrxozy0XCU0o
A4gFAepZj4GnRo7Hq7apN/GdPvOw/k7nuafDDdNpZ4YmoeWqnXzX4wvElu4ysNwX
gJLFtyqE/Ik/QiAakoV8NScCgYEAsJobBPnYJ611nWuqwAp9JArxw7Pa1bQucMS+
S4CXdokBZ0BCl0pYbr4qKaKUrd6WnfKnh1nCakhGds5nmAGd1+2PRiIFjN77GiRV
20B0T7nLj6oK1w7gQq6oz+vDcUkdlzr6QSXX/UTpTm338G0MAgeNO/fkDPlCouuG
wF0KQC0CgYEAy+xi5YeEK1yw4dCMYWsYHkqwSJgnB+OyZPD0KJlhg8pLnJGIFTWH
2GLDVVRTnfh55mqpwA2vryM55hd96I7+suwjvT0yD7ZPpFbF3HYV0oJ0uu0f0CVg
UhH4HB10A5JblqnNm+TUKsdrDn9vJZI3OxM5APapCkYG3avJawHfOt4=
-----END RSA PRIVATE KEY-----`,
    'utf8'
  );
  fs.writeFileSync(
    './networkTest/dappynodetest2.crt',
`-----BEGIN CERTIFICATE-----
MIIDBTCCAe2gAwIBAgIUMG5VpAsMHZEwlh/5qh4EBZ1JcaMwDQYJKoZIhvcNAQEL
BQAwGjEYMBYGA1UEAwwPPERBUFBZX05FVFdPUks+MB4XDTIyMDgzMTEwNDc0MFoX
DTMwMTExNzEwNDc0MFowGjEYMBYGA1UEAwwPPERBUFBZX05FVFdPUks+MIIBIjAN
BgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1xlJWlHJcubsHdZgMtdyLzuWSeRR
dWvK7h25TVu8bsGXDuPIRneKIZshIFuQrL6u8t6V/QgnBsP9mbZxNV9uFDir2tlS
+CBfihPgYny36MMRabBXWhKZrcgHAgDHlc8YOE3JNjLY04WVGuD1rm788cpfsG9n
B1rRn443qjHDqV0SIa/wY86rP5o36U9kRWGp/RyjXEGXuPKIAN7cCozEk+ZSegqv
irbODiKwii3kuIDpv5LKZge0Yu7k+1UIddYrGJHlr4xqVuF3+WaNDJ/rYtawm1xe
CUy3IYMpmPP6os3CLvRlNyKbxvJ+64w+ki99AFAvSMpBFAUyManulqsGHwIDAQAB
o0MwQTAgBgNVHREEGTAXggpsb2NhbGhvc3QygglkYXBweW5vZGUwHQYDVR0OBBYE
FBMhacJrvPskOdK54kkBsGTYw/FRMA0GCSqGSIb3DQEBCwUAA4IBAQATN0DAGx2q
CYNlpYSPnN3/FbicbQW+DzBKfG/8hA3cDoJZX3gfZb56M8oP9V4QBXlztz60BAG4
avC38ti0SbOxp0Gm5qkF5seotHJwcMoBq8G9/b2pKnbGMNrzAu7iV20+ChQ5Eo98
mpRejJ3OE0WFzcbZbapQ0xQKEO4Z3evZpjOmcHNtpUs4pe5MRZp335QFc5AZt9wq
WUF3GnrnNB5Rv/xXYIE2f9VgEclVTVJpOuvVjTobE1W/Qz66WSKvpb1W0669894Z
TxPRq2iq3EM3IFmCjrMeJ/766RgDibr0Rw+6vsa2vhj/Oe3JrCNl/tUkg0L28r3q
MaK+gyhQUbB8
-----END CERTIFICATE-----`,
    'utf8'
  );
  fs.writeFileSync(
    './networkTest/dappynodetest2.key',
`-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDXGUlaUcly5uwd
1mAy13IvO5ZJ5FF1a8ruHblNW7xuwZcO48hGd4ohmyEgW5Csvq7y3pX9CCcGw/2Z
tnE1X24UOKva2VL4IF+KE+BifLfowxFpsFdaEpmtyAcCAMeVzxg4Tck2MtjThZUa
4PWubvzxyl+wb2cHWtGfjjeqMcOpXRIhr/Bjzqs/mjfpT2RFYan9HKNcQZe48ogA
3twKjMST5lJ6Cq+Kts4OIrCKLeS4gOm/kspmB7Ri7uT7VQh11isYkeWvjGpW4Xf5
Zo0Mn+ti1rCbXF4JTLchgymY8/qizcIu9GU3IpvG8n7rjD6SL30AUC9IykEUBTIx
qe6WqwYfAgMBAAECggEAEa+CEPuNiTWEb3WbZkLBoDGRi1TK/9ETl914yWwEA8VG
EtLWujiE8ntrT1pH/HQXNV/ozCu57bv6o4NVLpLAncgFFVLuF/mtcVBuEBr6EhjL
2zlFDWJfIWNDdD41KtOixapbo2mt20Jt/o5FlQiKIqVFld+rBHdKqghK+mLqGAgo
2oBmHKchOsswvdiJf0czkO7ZQoEGHmj3r7iyUm3NLQC/NMgpA6T/KGa9eOlaXP/w
palppodJ6ytH++fF9juwh66tahRu+BhUa6hsREY43zJTk+e5cr0tNawdsk/Qfg0u
DBml963xFDZC7MYVUNHj6mQJNDTAUrXUnTGWhjVz5QKBgQDeI68iRQQxYngOtWut
X597ghLinmY32hTPFW2+DMxNY0AEpiaiRiAW7yH7gX2rXdoO0ZNUp+LHGxfZUHFH
aQZ8TWUHMZ8DLSGU90MeL+vgY4i0NNoSch/pUsDAeedtfi4Ms9027urDY8bc60ut
lJ9Dl4Jzbup091pXFTapQ/SBpQKBgQD34t0e7g8z6Tppkzna3soBDleue0ivl9Yw
CdpYushY12J5v34DWRB9PJr/TnB0V8+D+/BWXbp8hWC970QbmeF8arkWCn0dNvFX
qpBTiQqMlK+aYRQhPQWES5i0TprHD/kjnb0gA5KTCpMThWUGY4fgFHRXhnOGHCM0
F/N8cVVVcwKBgCpA+2U3X47NPiz+EVdPIxTpLxJwMt1Y3DBv0QofgRUPVfQMbrjb
Qeta3Unr3a2lEn9TGgU2Ugqxep3ZkVKWBafLSPZPWAHQqdyeE+RAFUv/Ytd0Xi64
Cp3lIcj65yyKndPIusFiPMGhzwfiseh4prrCrQusA2jwS/zYiic0R+QJAoGBANZ8
233+2PK+9QcTGDV1Hu8o/N+B11Pwmql4bRDnlaGhxJi6BAxbjXP/89HDinRw4qM+
ZSgl8835Dstp89G6JaylH7+dlcKons2PTVCqvJEFuqhnJabZCSP+0YP6m9xwys9x
lorT7IkE1lxGyTJs/s36hOyS7vT09dUGgG2GFyNXAoGAZ2I9+ugQfwrmKGVwlCA9
fAOHEgkOpauMvLVWJRiMqqvQdJds3nPoJ4h9yMmlRIA4eoiT5JG1ItjKXS94kYGm
S62/kjrEQWlksk3vhXboXrXHxvCyEiGIMlHRHiIhrG9dTWvKUKnuoStiObJbxVzI
7CocvEA47sGBGuo2ffyde8c=
-----END PRIVATE KEY-----`,
    'utf8'
  );
};
