import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";

export default {
  input: "src/index.ts",
  output: [
    {
      sourcemap: true,
      format: "esm",
      name: "Bees",
      file: `dist/index.js`,
    },
  ],
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json",
    }),
    resolve(),
    commonjs(),
  ],
};
