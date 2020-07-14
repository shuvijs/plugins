import { Runtime } from '@shuvi/types';
import { ServerStylesheetAppContext } from './types';

export default (
  documentProps: Runtime.IDocumentProps,
  appContext: ServerStylesheetAppContext
) => {
  const { sheet } = appContext;
  documentProps.scriptTags.push({
    tagName: 'script',
    attrs: {},
    innerHTML: `</script>${sheet.getStyleTags}`
  });
};
