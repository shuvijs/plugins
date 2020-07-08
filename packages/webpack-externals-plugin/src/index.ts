import { IApi, APIHooks } from '@shuvi/types';
import { BUNDLER_TARGET_SERVER } from 'shuvi';
import nodeExternals, {
  Options,
  WhitelistOption
} from 'webpack-node-externals';
import { ExternalsElement } from 'webpack';

export default class WebpackExternalsPlugin {
  option: Options;

  constructor(option: Options = {}) {
    this.option = option;
  }

  apply(api: IApi) {
    const { whitelist = [], ...otherOptions } = this.option;

    api.tap<APIHooks.IHookBundlerConfig>('bundler:configTarget', {
      name: 'webpackExternalPlugin',
      fn: (chain, { name, mode }) => {
        if (mode === 'development') {
          if (name === BUNDLER_TARGET_SERVER) {
            const externals = chain.get('externals') as ExternalsElement;
            chain.externals(
              ([] as ExternalsElement[])
                .concat(
                  externals,
                  nodeExternals({
                    whitelist: ([/^@shuvi\/app/] as WhitelistOption[])
                      .concat(whitelist)
                      .filter(Boolean),
                    ...otherOptions
                  }) as ExternalsElement
                )
                .filter(Boolean)
            );
          }
        }
        return chain;
      }
    });
  }
}
