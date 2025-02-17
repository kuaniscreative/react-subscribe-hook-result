import { createContext } from "react";

type SubscriptionContextValue = {
  subscriptionMap: Record<string, ((...params: any[]) => void)[]>;
  subscribe: (
    namespace: string,
    callback: (payload: any) => void,
  ) => VoidFunction;
  store: Record<string, any>;
};


export const SubscriptionContext = createContext<SubscriptionContextValue>({
  subscriptionMap: {},
  subscribe: () => () => { },
  store: {},
});