import { IApi, APIHooks } from '@shuvi/types';
import { BUNDLER_TARGET_CLIENT } from 'shuvi';

export default class SouremapPlugin {
  apply(api: IApi) {
    api.tap<APIHooks.IHookBundlerConfig>('bundler:configTarget', {
      name: 'enableSourcemap',
      fn: (chain, { name, mode, webpack }) => {
        if (mode !== 'production' || name !== BUNDLER_TARGET_CLIENT) {
          return chain;
        }

        chain.devtool(false);
        chain.plugin('source-map').use(webpack.SourceMapDevToolPlugin, [
          {
            append: false,
            filename: '[file].map'
          }
        ]);
        chain.optimization.minimizer('terser').tap(([options]) => [
          {
            ...options,
            sourceMap: true
          }
        ]);
        return chain;
      }
    });
  }
}
