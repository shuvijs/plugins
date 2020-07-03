import { Runtime } from '@shuvi/types';
import { CreateStore, InitStore, ReduxAppContext } from './types';
import { withRedux } from './withRedux';

interface ReduxPluginOptions {
  createStore?: CreateStore;
}
let currentStore: any = null;
export const getCurrentStore = () => currentStore;
const isServer = typeof window === 'undefined';

const reduxRuntimePlugin: Runtime.Plugin = (
  tap,
  options: ReduxPluginOptions = {}
) => {
  if (!options?.createStore) {
    throw new Error(
      'Please provide a createStore option to your "redux" in `src/plugin`'
    );
  }

  const { createStore } = options;

  const initStore: InitStore = ({ initialState, ctx }) => {
    const createStoreInstance = () =>
      createStore(initialState, {
        ...ctx,
        isServer
      });

    if (isServer) {
      return createStoreInstance();
    }

    // Memoize store if client
    if (currentStore === null) {
      currentStore = createStoreInstance();
    }

    return currentStore;
  };

  tap('createAppContext', {
    name: 'redux:initReduxStore',
    fn: (ctx: Runtime.ISeverAppContext) => {
      // instantiate store
      if (!ctx.store) {
        let initialState = {};

        if (ctx.pageData && ctx.pageData.redux) {
          initialState = ctx.pageData.redux;
        }

        ctx.store = initStore({ ctx, initialState });
      }

      return ctx;
    }
  });

  tap('getAppComponent', {
    name: 'redux:wrapWithRedux',
    fn: (App: any, appContext: ReduxAppContext) => {
      return withRedux(App, appContext);
    }
  });

  tap('server:getPageData', {
    name: 'redux:setInitialState',
    fn: (ctx: ReduxAppContext) => {
      const { store } = ctx;

      delete ctx.store;

      return { redux: store.getState() };
    }
  });
};

export default reduxRuntimePlugin;
