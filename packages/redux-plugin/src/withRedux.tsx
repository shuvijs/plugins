import React from 'react';
import { Provider } from 'react-redux';
import { ReduxAppContext } from './types';

export const withRedux = (App: any, appContext: ReduxAppContext) => {
  const ReduxAppWrapper = (appProps: any) => {
    return (
      <Provider store={appContext.store}>
        <App {...appProps} />
      </Provider>
    );
  };

  ReduxAppWrapper.getInitialProps = App.getInitialProps;
  ReduxAppWrapper.displayName = 'ReduxAppWrapper';

  return ReduxAppWrapper;
};
