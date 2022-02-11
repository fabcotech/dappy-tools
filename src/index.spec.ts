import http from 'http';
import { lookup, createNodeLookup } from './index';

describe('tests', () => {
  it('lookup()', async () => {
    const r = await lookup('foo');
    console.log(r);
  });

  it('createNodeLookup()', () => {
    const { lookup } = createNodeLookup();
    http.get(
      'http://your-dappy-name/',
      {
        lookup
      },
      (res) => {
        res.setEncoding('utf8');
        res.on('data', (data) => {
          console.log('ok');
        });
      }
    );
  });
});
