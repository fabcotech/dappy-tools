import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript';
import json from 'rollup-plugin-json';
import replace from '@rollup/plugin-replace';
import sourcemaps from 'rollup-plugin-sourcemaps';

const production = process.env.NODE_ENV === 'production';

export default {
  input: 'src/index.ts',
  output: {
    format: 'cjs',
    file: 'dist/index.js',
    sourcemap: !production,
  },
  plugins: [
    sourcemaps(),
    typescript(),
    resolve(),
    commonjs(),
    json(),
    replace({
      'process.env.PRODUCTION': production ? 'true' : 'false',
    }),
  ],
};
