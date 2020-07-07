import { IApi, APIHooks } from '@shuvi/types';
import path from 'path';
import { BUNDLER_TARGET_CLIENT } from 'shuvi';

const DEFAULT_VENORS = [
  'react',
  'react-dom',
  'react-router',
  'react-router-dom',
  '@shuvi/runtime-core'
];

interface DllPluginOption {
  vendors: string[];
}

export default class WebpackDllPlugin {
  options: DllPluginOption;

  constructor(options: DllPluginOption) {
    this.options = options;
  }

  apply(api: IApi) {
    const { buildDir, rootDir } = api.paths;
    const { vendors = [] } = this.options;

    const autodllCachePath = path.resolve(
      path.join(buildDir, 'cache', 'autodll-webpack-plugin')
    );

    const autoDllWebpackPluginPaths = require('autodll-webpack-plugin/lib/paths');
    autoDllWebpackPluginPaths.cacheDir = autodllCachePath;
    autoDllWebpackPluginPaths.getManifestPath = (hash: string) => (
      bundleName: string
    ) => path.resolve(autodllCachePath, hash, `${bundleName}.manifest.json`);

    api.tap<APIHooks.IHookBundlerConfig>('bundler:configTarget', {
      name: 'webpackDllPlugin',
      fn: (chain, { name, mode }) => {
        if (mode === 'development') {
          if (name === BUNDLER_TARGET_CLIENT) {
            const resolveConfig = chain.toConfig().resolve!;
            chain
              .plugin('webpackDllPlugin')
              .before('private/build-manifest')
              .use(require('autodll-webpack-plugin'), [
                {
                  filename: '[name]_[hash].js',
                  path: './static/dll',
                  debug: true,
                  inject: false,
                  context: rootDir,
                  entry: {
                    dll: [...DEFAULT_VENORS, ...(vendors || [])]
                  },
                  config: {
                    mode,
                    resolve: resolveConfig,
                    devtool: 'cheap-module-source-map'
                  }
                }
              ]);
          }
        }
        return chain;
      }
    });
  }
}
