import { IApi, APIHooks } from '@shuvi/types';
import { BUNDLER_TARGET_SERVER } from 'shuvi';
import nodeExternals, {
  Options,
  WhitelistOption
} from 'webpack-node-externals';

export default class WebpackExternalsPlugin {
  option: Options;

  constructor(option: Options = {}) {
    this.option = option;
  }

  apply(api: IApi) {
    const { whitelist = [], ...otherOptions } = this.option;

    api.tap<APIHooks.IHookBundlerConfig>('bundler:configTarget', {
      name: 'webpackExternalPlugin',
      fn: (chain, { name, mode, helpers }) => {
        if (mode === 'development') {
          if (name === BUNDLER_TARGET_SERVER) {
            helpers.addExternals(chain, (context, request, next) => {
              const customCallback: any = (err: any, result: any) => {
                if (!err && !result) {
                  next(null, 'next');
                } else {
                  next(err, result);
                }
              };

              nodeExternals({
                whitelist: ([/^@shuvi\/app/] as WhitelistOption[])
                  .concat(whitelist)
                  .filter(Boolean),
                ...otherOptions
              })(context, request, customCallback);
            });
          }
        }
        return chain;
      }
    });
  }
}
