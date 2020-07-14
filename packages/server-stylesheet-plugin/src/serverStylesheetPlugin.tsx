import React from 'react';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';
import { Runtime } from '@shuvi/types';

const serverStylesheetPlugin: Runtime.Plugin = tap => {
  if (typeof window === 'undefined') {
    const sheet = new ServerStyleSheet();

    tap('createAppContext', {
      name: 'serverStyleSheet:injectSheetInstance',
      fn: (ctx: Runtime.ISeverAppContext) => {
        ctx.sheet = sheet;
        return ctx;
      }
    });

    tap('getAppComponent', {
      name: 'serverStyleSheet:wrapServerStyleSheet',
      fn: (App: any, appContext: any) => {
        if (appContext.req) {
          const ServerStyleSheetComponent: any = (props: any) => (
            <StyleSheetManager sheet={sheet.instance}>
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
