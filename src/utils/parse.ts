import { urlRegExp } from './validation';
import { JSONArray, JSONObject } from './json';

export const parseUrl = (url: string) => {
  if (!urlRegExp.test(url)) {
    return undefined;
  }
  const [, scheme, hostname, port] = url.match(urlRegExp) || [];
  return {
    scheme,
    hostname,
    port: port || (scheme === 'http' ? '80' : '443'),
  };
};

export const tryParseJSON = (
  raw: string,
): JSONObject | JSONArray | undefined => {
  try {
    return JSON.parse(raw);
  } catch (e) {
    return undefined;
  }
};
