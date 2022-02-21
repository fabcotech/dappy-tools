export function print(str: string) {
  // eslint-disable-next-line no-console
  console.log(str);
}

export interface Api {
  print: typeof print;
}
