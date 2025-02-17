import { type ReactNode, useContext, useEffect, useRef } from 'react';
import { useHookResults } from './useHookResults';
import { SubscriptionContext } from './constants';
import { useDidUpdate } from './useDidUpdate';

export type HookDef = {
    namespace: string;
    use: (subscribedHookResults: Record<string, any>) => any;
    subscriptions?: string[];
  };

interface HooksProps {
  hookDefinitions: HookDef[];
  prevHookResults?: Record<string, any>;
}


function InternalHookCaller({
  subscriptions,
  use,
}: Omit<HookDef, 'namespace'>) {
  const subscriptionPayload = useHookResults(subscriptions);

  use(subscriptionPayload);

  return null;
}

function Hooks({ hookDefinitions }: HooksProps) {
  return (
    <>
      {hookDefinitions.map((hookDef) => (
        <InternalHookCaller
          key={hookDef.namespace}
          {...hookDef}
        />
      ))}
    </>
  );
}

function useHookSubscription(
  namespace: string,
  use: (...params: any[]) => any,
) {
  const res = use();
  const { subscriptionMap } = useContext(SubscriptionContext);
  const isFirstRenderRef = useRef(true);  

  function publish() {
    if (Array.isArray(subscriptionMap[namespace])) {
      subscriptionMap[namespace].forEach((callback) => {
        callback(res);
      });
    }
  }

  if (isFirstRenderRef.current) {
    publish();
    isFirstRenderRef.current = false
  } 

  useDidUpdate(() => {
    publish()
  }, [namespace, res, subscriptionMap]);
}

type SubscriptionProviderProps = {
  children?: ReactNode;
  hooks: Record<string, Omit<HookDef, "namespace">>;
};

export default function SubscriptionProvider({
  children,
  hooks,
}: SubscriptionProviderProps) {
  const payloadRef = useRef<Record<RequestKey, any>>({});

  function createSubsInitial() {
    return Object.keys(hooks).reduce(
      (acc, namespace) => {
        acc[namespace] = [
          (payload: any) => {
            payloadRef.current[namespace] = payload;
          },
        ];

        return acc;
      },
      {} as Record<RequestKey, any>,
    );
  }

  type RequestKey = keyof typeof hooks;

  const subsRef = useRef(createSubsInitial());

  const subscribeRef = useRef(
    (namespace: string, callback: (payload: any) => void): VoidFunction => {
      const subs = subsRef.current[namespace];

      if (subs) {
        subs.push(callback);
      } else {
        subsRef.current[namespace] = [callback];
      }

      return () => {
        const index = subsRef.current[namespace]?.indexOf(callback);

        if (index && index !== -1) {
          subsRef.current[namespace] = [
            ...subsRef.current[namespace].slice(0, index),
            ...subsRef.current[namespace].slice(index + 1),
          ];
        }
      };
    },
  );

  const hookDefinitions = Object.entries(hooks).map<HookDef>(
    ([namespace, { use, subscriptions }]) => ({
      namespace,
      use: (subscribedHookResults: Record<string, any>) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useHookSubscription(namespace, () => use(subscribedHookResults));
      },
      subscriptions,
    }),
  );

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptionMap: subsRef.current,
        subscribe: subscribeRef.current,
        store: payloadRef.current,
      }}
    >
      <Hooks hookDefinitions={hookDefinitions} />
      {children}
    </SubscriptionContext.Provider>
  );
}
