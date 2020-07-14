import React from 'react';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';
import { Runtime } from '@shuvi/types';
import { ServerStylesheetAppContext } from './types';

const serverStylesheetPlugin: Runtime.Plugin = tap => {
  if (typeof window === 'undefined') {
    tap('createAppContext', {
      name: 'serverStyleSheet:injectSheetInstance',
      fn: (ctx: Runtime.ISeverAppContext) => {
        const sheet = new ServerStyleSheet();
        ctx.sheet = sheet;
        return ctx;
      }
    });

    tap('getAppComponent', {
      name: 'serverStyleSheet:wrapServerStyleSheet',
      fn: (App: any, appContext: ServerStylesheetAppContext) => {
        if (appContext.req) {
          const ServerStyleSheetComponent: any = (props: any) => (
            <StyleSheetManager sheet={appContext.sheet.instance}>
              <App {...props} />
            </StyleSheetManager>
          );
          ServerStyleSheetComponent.getInitialProps = App.getInitialProps;
          return ServerStyleSheetComponent;
        }
        return App;
      }
    });
  }
};

export default serverStylesheetPlugin;
