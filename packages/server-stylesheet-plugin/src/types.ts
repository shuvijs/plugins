import { ServerStyleSheet } from 'styled-components';
import { Runtime } from '@shuvi/types';

export type ServerStylesheetAppContext = Runtime.ISeverAppContext & {
  sheet: ServerStyleSheet;
};
