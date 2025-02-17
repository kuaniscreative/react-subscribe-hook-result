import { useContext, useMemo, useRef, useSyncExternalStore } from "react";
import { SubscriptionContext } from "./constants";

export function useHookResults(namespaces: string[] | undefined = []) {
  const { subscribe, store } = useContext(SubscriptionContext);

  const prevDataRef = useRef<Record<string, any>>({});

  const subscription = useMemo(() => {
    return {
      sync: (callback: VoidFunction) => {
        const cleanups = namespaces.map((namespace) =>
          subscribe(namespace, callback)
        );

        return () => {
          cleanups.forEach((cleanup) => cleanup());
        };
      },
      getSnapshot: () => {
        namespaces.forEach((namespace) => {
          const currentValue = store[namespace];

          if (currentValue !== prevDataRef.current[namespace]) {
            prevDataRef.current = {
              ...prevDataRef.current,
              [namespace]: currentValue,
            };
          }
        });

        return prevDataRef.current;
      },
    };
  }, [namespaces, store, subscribe]);

  return useSyncExternalStore(subscription.sync, subscription.getSnapshot);
}
