const dummyRecord = {
    addresses: ["127.0.0.1"],
    ca: [`-----BEGIN CERTIFICATE-----
MIIFCDCCA3CgAwIBAgIRAKr1mcWwNGLaPD1w5zjuBKswDQYJKoZIhvcNAQELBQAw
gZsxHjAcBgNVBAoTFW1rY2VydCBkZXZlbG9wbWVudCBDQTE4MDYGA1UECwwvcGF1
bG11c3NvQG1hY2Jvb2stcHJvLWRlLXBhdWwuaG9tZSAoUGF1bCBNdXNzbykxPzA9
BgNVBAMMNm1rY2VydCBwYXVsbXVzc29AbWFjYm9vay1wcm8tZGUtcGF1bC5ob21l
IChQYXVsIE11c3NvKTAeFw0xOTEyMjIxMzIwNDBaFw0yOTEyMjIxMzIwNDBaMIGb
MR4wHAYDVQQKExVta2NlcnQgZGV2ZWxvcG1lbnQgQ0ExODA2BgNVBAsML3BhdWxt
dXNzb0BtYWNib29rLXByby1kZS1wYXVsLmhvbWUgKFBhdWwgTXVzc28pMT8wPQYD
VQQDDDZta2NlcnQgcGF1bG11c3NvQG1hY2Jvb2stcHJvLWRlLXBhdWwuaG9tZSAo
UGF1bCBNdXNzbykwggGiMA0GCSqGSIb3DQEBAQUAA4IBjwAwggGKAoIBgQCr8L71
cl5Wxx67tzCO3lm1WtLwaIf+eqbWRkfoOhIALAZZP9SeYjsJOI5ENY3j/AYaFpNG
LPRNoRkFKuF5XHC648ybexQN088OZCFVN9k+InXISbbWBAB6PNW6+Pobb72IGiSb
ygQV7HarBqN1L1JHduJmEjfEpSPCh34C8cI6qSrKstLATlAB36v1XP5DiYJYbx5x
w8hn/yyPdujkgjAaTyG8detnnpGbLf9z7fjef874Fto6T6gts8UV26d9mNTn1/gs
1+fVV4KoHZc57reou2DeG2SsCe0zl0hJMBnb5+srb1grmQubdmuKz9aA/+Sc5KTQ
LSXFdo0d0QZjk0Lp2Q86XaWLU1Yn2YaKTKneo61agfDhpfcSJJS3bWUIdYPgyufT
chR4wTAZdfLdaMKS7LR5Jyj4bi6U1RpUc1dhAqmcl2lRATlQApSZPFNQMxtMQ4UF
dqHxZ4SCrhWx3HWbvqKej0lQy26220hDCX++D/dNrBYnfsZFFK9PHl6gZM8CAwEA
AaNFMEMwDgYDVR0PAQH/BAQDAgIEMBIGA1UdEwEB/wQIMAYBAf8CAQAwHQYDVR0O
BBYEFBU2h1vbv73nbFmEw18jbc+2bbOqMA0GCSqGSIb3DQEBCwUAA4IBgQCgYmeo
Gw1jykFznBjGWsviodcw12lOAJfXxhYJCdsL2x7pWbLKDGga8FDxi66KNH5ahhWl
bhRzMoRbWbT14ey1nOHUbwIR6w/5MZ6rftfOh+CWGNqZZ4O32i6o1SltQ7arSfeW
6K6S0N/KyyRxzjA00uyIywgathhpSix0hu8sG8xfBSsHFfUI5jt38pk6RXXJQ/GR
Gb04E0aAA6Wt5KfOn7FRY2BcH7/7usXv+eZH1eiFQbwlUVMG8oamQXyKeBuBzRHG
AtcExTrn17AElT06jbET0zuCigwTA5eGsUkt9gzK4W2GbdtjoLwvk3Mldv8XlHHc
TYjihznr0Z+EgNuB98unuo1/JnxPBCZ4EfzvJaMEPdN2Fexddr4ilBG4N6uURv49
O1eXkQXqXMz+IOFQJGL/xkpEWMkOtQlJZmqj+KmmcYXEPYU4dK8VAHkoXIGiVkeP
0+cKdGty/fijp4JDZqY14Feosbr8eY3glg7sIozB+nKvxht/CY8eUj++zfE=
-----END CERTIFICATE-----`]
}

function lookupRecord(name, options) {
    return Promise.resolve(dummyRecord);
}

function isIPv4(address) {
    return /\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}\b/.test(address);
}

function isIPv6(address) {
    return /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/.test(address);
}

function createCached(action) {
    const cache = {};

    return async (name) => {
        if (!cache[name]) {
            cache[name] = {
                value: await action(name),
                hit: 0,
                age: Date.now()
            };
        } else {
            cache[name].hit++;
        }
        return cache[name].value;
    }
} 

const createNodeLookup = (lookupRecord) => async (name, options, callback) => {
    const family =  options.family === 6 ? 6 : 4;

    const ipFormatPredicat = family === 6 ? isIPv6 : isIPv4;
    const record = await lookupRecord(name)

    const addresses = record.addresses.filter(ipFormatPredicat);

    if (addresses.length === 0) {
        callback(new Error(`No address found for name ${name} (format: IPv${options.family})`));
        return;
    }

    if (options.all) {
        callback(null, addresses, family);
        return;
    } else {
        callback(null, addresses[0], family);
        return;
    }
}

const createGetCA = (lookupRecord) => async (name) => {
    const record = await lookupRecord(name); 

    return record.ca;
}

function createCachedNodeLookup() {
    const cachedLookup = createCached(lookupRecord);

    return {
        lookup: createNodeLookup(cachedLookup),
        getCA: createGetCA(cachedLookup)
    }
}

module.exports = {
    createNodeLookup: createCachedNodeLookup,
    lookup: lookupRecord
}