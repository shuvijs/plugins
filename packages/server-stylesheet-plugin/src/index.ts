import { IApi, APIHooks } from '@shuvi/types';
import path from 'path';
import { ServerStylesheetAppContext } from './types';
import injectStyleTags from './injectStyleTags';

export default class ServerStylesheetPlugin {
  apply(api: IApi) {
    const stylesheetPlugin = path.join(__dirname, 'serverStylesheetPlugin');
    api.addRuntimePlugin('serverStylesheet', stylesheetPlugin);
    api.tap<APIHooks.IHookModifyHtml>('modifyHtml', {
      name: 'serverStylesheetPlugin:injectStyleTags',
      fn: (documentProps, appContext: any) => {
        documentProps = injectStyleTags(
          documentProps,
          appContext as ServerStylesheetAppContext
        );
        return documentProps;
      }
    });
  }
}
