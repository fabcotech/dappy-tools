import http from 'http';
import { lookup, createNodeLookup } from './index';

describe('tests', () => {
  it('lookup()', async () => {
    const r = await lookup('foo');
    console.log(r);
  });

  it('createNodeLookup()', () => {
    const { nodeLookup } = createNodeLookup();
    http.get(
      'http://your-dappy-name/',
      {
        lookup: nodeLookup,
      },
      (res) => {
        res.setEncoding('utf8');
        res.on('data', () => {
          console.log('ok');
        });
      },
    );
  });
});
