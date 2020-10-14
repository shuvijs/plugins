import { IApi, APIHooks } from '@shuvi/types';
import { BUNDLER_TARGET_SERVER } from 'shuvi';
import nodeExternals, {
  Options,
  AllowlistOption
} from 'webpack-node-externals';

export default class WebpackExternalsPlugin {
  option: Options;

  constructor(option: Options = {}) {
    this.option = option;
  }

  apply(api: IApi) {
    const { allowlist = [], ...otherOptions } = this.option;

    api.tap<APIHooks.IHookBundlerConfig>('bundler:configTarget', {
      name: 'webpackExternalPlugin',
      fn: (chain, { name, helpers }) => {
        if (name === BUNDLER_TARGET_SERVER) {
          helpers.addExternals(chain, (context, request, next) => {
            // support webpack5
            if (typeof next === 'undefined') {
              const {
                context: webpack5Context,
                request: webpack5Request
              } = context;
              next = request; // webppack5
              context = webpack5Context;
              request = webpack5Request;
            }

            const customCallback: any = (err: any, result: any) => {
              if (!err && !result) {
                next(null, 'next');
              } else {
                next(err, result);
              }
            };

            const nodeExternalsFn = nodeExternals({
              allowlist: ([
                /^@shuvi\/app/,
                /^@shuvi\/router-react/
              ] as AllowlistOption[])
                .concat(allowlist)
                .filter(Boolean),
              ...otherOptions
            });

            nodeExternalsFn(context, request, customCallback);
          });
        }
        return chain;
      }
    });
  }
}
