import React from 'react';
import { Store } from 'redux';
import { Provider } from 'react-redux';
import { getCurrentStore } from './reduxRuntimePlugin';

export const withRedux = (App: any) => {
  let store: Store | null = null;
  const WrapperApp = () => {
    return (
      <Provider store={store || getCurrentStore()}>
        <App />
      </Provider>
    );
  };

  WrapperApp.getInitialProps = async (ctx: any) => {
    if (ctx.isServer) {
      store = ctx.appContext.store;
    }
    if (App.getInitialProps) {
      return App.getInitialProps(ctx);
    }
    await ctx.fetchInitialProps();
    return {};
  };

  return WrapperApp;
};
