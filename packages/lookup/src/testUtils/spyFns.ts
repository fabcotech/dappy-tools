import chai from 'chai'; // eslint-disable-line import/no-extraneous-dependencies

export const spyFns = (fns: ((...args: any[]) => Promise<any>)[]) => {
  let call = -1;

  return chai.spy((...args: any[]) => {
    call += 1;
    return fns[call](...args);
  });
};
