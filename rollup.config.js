import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: {
    sourcemap: true,
    format: 'umd',
    name: 'Bees',
    file: `dist/index.js`,
  },
  plugins: [typescript(), resolve(), commonjs(), json()],
};
