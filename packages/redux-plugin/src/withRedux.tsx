import React from 'react';
import { Provider } from 'react-redux';
import { ReduxAppContext } from './types';

export const withRedux = (App: any, appContext: ReduxAppContext) => {
  const ReduxAppWrapper = () => {
    return (
      <Provider store={appContext.store}>
        <App />
      </Provider>
    );
  };

  ReduxAppWrapper.getInitialProps = App.getInitialProps;
  ReduxAppWrapper.displayName = 'ReduxAppWrapper';

  return ReduxAppWrapper;
};
