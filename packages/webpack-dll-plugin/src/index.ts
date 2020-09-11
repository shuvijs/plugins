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
  ignore: string[];
}

export default class WebpackDllPlugin {
  options: DllPluginOption;

  constructor(options: DllPluginOption) {
    this.options = options;
  }

  apply(api: IApi) {
    const { rootDir } = api.paths;
    const { vendors = [], ignore = [] } = this.options;
    let dllFile: string;

    api.tap<APIHooks.IHookBundlerConfig>('bundler:configTarget', {
      name: 'webpackDllPlugin',
      stage: 999, // last to run
      fn: (chain, { name, mode, webpack }) => {
        if (mode === 'development') {
          if (name === BUNDLER_TARGET_CLIENT) {
            const aliasPackages = Object.keys(chain.resolve.alias.entries());
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
                    dll: [...DEFAULT_VENORS, ...(vendors || [])].filter(
                      vendor => ![...ignore, ...aliasPackages].includes(vendor)
                    )
                  },
                  inherit: (webpackConfig: any) => {
                    return {
                      mode,
                      resolve: webpackConfig.resolve,
                      devtool: 'cheap-module-source-map'
                    };
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
