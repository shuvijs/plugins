import { IApi, APIHooks } from '@shuvi/types';
import { BUNDLER_TARGET_CLIENT } from 'shuvi';
import { Compiler } from 'webpack';

const DEFAULT_VENORS = [
  'react',
  'react-dom',
  'react-router',
  'react-router-dom',
  '@shuvi/runtime-react',
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
    const { rootDir } = api.paths;
    const { vendors = [] } = this.options;
    let dllFile: string;

    api.tap<APIHooks.IHookBundlerConfig>('bundler:configTarget', {
      name: 'webpackDllPlugin',
      fn: (chain, { name, mode, webpack }) => {
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
            class GetDllFilePlugin {
              apply(compiler: Compiler) {
                compiler.hooks.emit.tapAsync(
                  'GetDllFilePlugin',
                  (compilation, callback) => {
                    dllFile =
                      api.config.publicPath + // /_shuvi/[dll]
                      Object.keys(compilation.assets).find((asset: string) =>
                        /^static\/dll\//.test(asset)
                      )!;
                    callback();
                  }
                );
              }
            }
            chain
              .plugin('getDllFile')
              .after('webpackDllPlugin')
              .use(GetDllFilePlugin);
          }
        }
        return chain;
      }
    });

    api.tap<APIHooks.IHookModifyHtml>('modifyHtml', {
      name: 'injectDllScript',
      fn: docProps => {
        docProps.scriptTags.unshift({
          tagName: 'script',
          attrs: {
            src: dllFile
          }
        });
        return docProps;
      }
    });
  }
}
