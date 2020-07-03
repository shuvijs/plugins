import { Store, Action, AnyAction } from 'redux';
import { Runtime } from '@shuvi/types';

type InjectedParams = {
  isServer: boolean;
};

export type CreateStore<S = any, A extends Action = AnyAction> = (
  initalState: S,
  ctx: Runtime.ISeverAppContext & InjectedParams
) => Store<S, A>;

export type InitStore = <S = any, A extends Action = AnyAction>(params: {
  initialState: S;
  ctx: Runtime.ISeverAppContext;
}) => Store<S, A>;

export type ReduxAppContext = {
  store: Store<any, any>;
};
