import { IApi } from '@shuvi/types';
import path from 'path';

export default class WebpackExternalsPlugin {
  apply(api: IApi) {
    const stylesheetPlugin = path.join(__dirname, 'serverStylesheetPlugin');
    api.addRuntimePlugin('serverStylesheet', stylesheetPlugin);
  }
}
