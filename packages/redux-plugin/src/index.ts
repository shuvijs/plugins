import { IApi } from '@shuvi/types';
import { join } from 'path';

export default class ReduxPlugin {
  apply(api: IApi) {
    const reduxPluginPath = join(__dirname, 'reduxRuntimePlugin');
    console.log({ pp: require.resolve(reduxPluginPath) });
    api.addRuntimePlugin('redux', reduxPluginPath);
  }
}
