import { Runtime } from '@shuvi/types';
import { ServerStylesheetAppContext } from './types';

const injectStyleTags = (
  documentProps: Runtime.IDocumentProps,
  appContext: ServerStylesheetAppContext
) => {
  const { sheet } = appContext;
  documentProps.headTags.push({
    tagName: 'script',
    attrs: {},
    innerHTML: `</script>${sheet.getStyleTags()}`
  });
};

export default injectStyleTags;
