const https = require('https');
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