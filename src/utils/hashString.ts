// Source implementation: https://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
export const hashString = (str = '') => {
  let hash = 0;

  if (str.length === 0) return hash.toString();
  for (let i = 0; i < str.length; i += 1) {
    const chr = str.charCodeAt(i);
    // eslint-disable-next-line no-bitwise
    hash = (hash << 5) - hash + chr;
    // eslint-disable-next-line no-bitwise
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString();
};
