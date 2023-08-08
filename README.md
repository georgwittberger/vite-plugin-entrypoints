# vite-plugin-entrypoints

![GitHub Release Workflow Status](https://img.shields.io/github/actions/workflow/status/georgwittberger/vite-plugin-entrypoints/release.yml?branch=main)
![npm Version](https://img.shields.io/npm/v/vite-plugin-entrypoints)
![npm Downloads](https://img.shields.io/npm/dw/vite-plugin-entrypoints)
![License](https://img.shields.io/github/license/georgwittberger/vite-plugin-entrypoints)
![GitHub Repo Stars](https://img.shields.io/github/stars/georgwittberger/vite-plugin-entrypoints?style=social)

Vite plugin to generate additional entry points for files matching glob patterns.

## Purpose

Modern JavaScript libraries should be built with tree-shaking and code splitting in mind. It allows applications to eliminate unused code, thus reducing the amount of JavaScript code sent to clients.

For a library which exposes a single main module it is important to split code exported from that module into separate chunks.

An example for tree-shakable library looks like this:

```js
// main.js (assuming this is the main module in package.json)
export { a } from './module-a';
export { b } from './module-b';

// module-a.js
export const a = 'a';

// module-b.js
export const b = 'b';
```

When building a library using [Vite library mode](https://vitejs.dev/guide/build.html#library-mode) the built distribution is usually one single JavaScript file. In order to create a tree-shakable output we have to apply one of the [code splitting techniques](https://rollupjs.org/guide/en/#code-splitting) supported by rollup.js.

One common practice is to define multiple entry points to force rollup.js to split code into chunks. In the example above we would not only define `main.js` as our single entry point but also `module-a.js` and `module-b.js`, even if their bundle output is never meant to be used directly by library consumers.

In a Vite configuration file it would look like this:

```js
// vite.config.js
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: {
        main: resolve(__dirname, 'main.js'),
        'module-a': resolve(__dirname, 'module-a.js'),
        'module-b': resolve(__dirname, 'module-b.js'),
      },
      name: 'MyLib',
      fileName: 'my-lib',
    },
  },
});
```

But what if we have a huge library with lots of components or modules exported from the main entry point? It becomes annoying to list every relevant entry file into our Vite configuration file.

This plugin solves our problem by generating entry points for all files matching given glob patterns.

## Installation

```bash
# NPM
npm install vite-plugin-entrypoints --save-dev

# Yarn
yarn add vite-plugin-entrypoints --dev

# PNPM
pnpm add vite-plugin-entrypoints --save-dev
```

## Usage

Import the plugin in your Vite configuration file and add it to the `plugins` array.

```js
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import entrypoints from 'vite-plugin-entrypoints';

export default defineConfig({
  plugins: [
    entrypoints({
      entryFilePatterns: ['modules/**/*.js'],
      // more optional settings
    }),
  ],
  build: {
    lib: {
      entry: { main: resolve(__dirname, 'main.js') },
    },
  },
});
```

> **Important:** The value of the `entry` property in your `build.lib` options must be an object! Usage of just a string or an array is not supported yet.

## Configuration

| Option              | Type       | Required | Default                                  | Description                                                                                                                                                             |
| ------------------- | ---------- | -------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `entryFilePatterns` | `string[]` | yes      | -                                        | Glob patterns to match entry files in base directory. A separate entry chunk is created for each matching file.<br/>Example: `['modules/**/*.js']`                      |
| `baseDir`           | `string`   | no       | `process.cwd()`                          | Base directory to resolve entry file patterns from. This path is stripped from entry file names.<br/>Example: `'src'`                                                   |
| `entryNameMapper`   | `function` | no       | Matched file name with extension removed | Mapping function to generate entry names for entry files. Receives matched file name as argument and must return new file name.<br/>Example: `name => 'prefix/' + name` |

## Contributing

1. Fork this Git repository.
2. Create a new feature/bugfix branch and make your changes.
3. Add a changeset to your branch by running `pnpm changeset` and pick a suitable version increment for your change according to semantic versioning. Enter a brief description of your change.
4. Create a pull request targeting our `main` branch.

## License

[MIT](https://opensource.org/licenses/MIT)
