import { Runtime } from '@shuvi/types';
import { CreateStore, InitStore } from './types';

let currentStore: any = null;
export const getCurrentStore = () => currentStore;
const isServer = typeof window === 'undefined';

// @ts-ignore Plugin type error
const reduxRuntimePlugin: Runtime.Plugin = (tap, createStore?: CreateStore) => {
  if (!createStore) {
    throw new Error(
      'Please provide a createStore option to your "redux" in `src/plugin`'
    );
  }

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
    name: 'inject-redux instance',
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
  tap('server:getPageData', {
    name: 'redux:setInitialState',
    fn: (ctx: Runtime.ISeverAppContext) => {
      const { store } = ctx;

      return { redux: store.getState() };
    }
  });
};

export default reduxRuntimePlugin;
