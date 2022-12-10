import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

//const isProduction = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.cjs.min.js',
      format: 'cjs',
      plugins: [terser(),]
    },
    {
      file: 'dist/index.es.js',
      format: 'esm'
    },
    {
      file: 'dist/index.min.js',
      format: 'iife',
      name: '$instant',
      plugins: [terser()]
    }],
  plugins: [
    typescript(),
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
    commonjs(),
    //isProduction && terser({ format: { comments: false } }),
  ],
};