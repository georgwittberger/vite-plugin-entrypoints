import { glob } from 'glob';
import { isAbsolute, resolve as resolvePath } from 'node:path';
import type { PluginOption } from 'vite';

/**
 * Entrypoints plugin options.
 */
export interface EntrypointsOptions {
  /**
   * Base directory to resolve entry file patterns from. This path is stripped from entry file names.
   *
   * Relative path is resolved from current working directory.
   *
   * Default is current working directory.
   *
   * Example: `'src'`
   */
  baseDir?: string;
  /**
   * Glob patterns to match entry files in base directory.
   *
   * A separate entry chunk is created for each matching file.
   *
   * Example: `['modules/*.js']`
   */
  entryFilePatterns: string[];
  /**
   * Mapping function to generate entry names for entry files.
   *
   * Receives matched file name as argument and must return a string representing the entry name of the file.
   *
   * Example: `fileName => 'prefix/' + fileName`
   *
   * @param fileName Matched entry file name excluding base directory.
   * @returns Entry name for given entry file.
   */
  entryNameMapper?: (fileName: string) => string;
}

/**
 * Vite plugin to generate additional entry points for files matching glob patterns.
 *
 * @param pluginOptions Plugin configuration options.
 * @returns Vite plugin configuration.
 */
const entrypoints = (pluginOptions: EntrypointsOptions): PluginOption => ({
  name: 'vite-plugin-entrypoints',
  async options(options) {
    if (pluginOptions.entryFilePatterns.length < 1) return;
    const basePath = resolveBasePath(pluginOptions.baseDir);
    const entryFiles = await findEntryFiles(
      pluginOptions.entryFilePatterns,
      basePath,
    );
    if (entryFiles.length < 1) return;
    const entrypoints = createEntrypoints(entryFiles, basePath, pluginOptions);
    return {
      ...options,
      input: {
        ...(typeof options.input === 'object' ? options.input : {}),
        ...entrypoints,
      },
    };
  },
});

const resolveBasePath = (baseDir?: string) =>
  baseDir && isAbsolute(baseDir)
    ? baseDir
    : resolvePath(process.cwd(), baseDir || '.');

const findEntryFiles = async (patterns: string[], basePath: string) => {
  const patternMatches = await Promise.all(
    patterns.map((pattern) => findFilesByPattern(pattern, basePath)),
  );
  return patternMatches.flat();
};

const findFilesByPattern = (pattern: string, basePath: string) =>
  glob(pattern, { cwd: basePath });

const createEntrypoints = (
  entryFiles: string[],
  basePath: string,
  pluginOptions: EntrypointsOptions,
) =>
  entryFiles.reduce<Record<string, string>>((entrypoints, entryFile) => {
    const entryName = pluginOptions.entryNameMapper
      ? pluginOptions.entryNameMapper(entryFile)
      : entryFile.replace(/\.[^.]*$/, '');
    entrypoints[entryName] = resolvePath(basePath, entryFile);
    return entrypoints;
  }, {});

export default entrypoints;
