import { useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { SubscriptionContext } from "./constants";

export function useHookResults(namespaces: string[] | undefined = []): any {
  const { subscribe, store } = useContext(SubscriptionContext);

  const value = namespaces.reduce((acc, namespace) => {
    return {
      ...acc,
      [namespace]: store[namespace]
    }
  }, {});

  const [, setTrigger] = useState(false);

  useEffect(() => {
    const cleanups = namespaces.map((namespace) =>
      subscribe(namespace, () => setTrigger((prev) => !prev))
    );

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [namespaces, subscribe])

  // const prevDataRef = useRef<Record<string, any>>({});

  // const subscription = useMemo(() => {
  //   return {
  //     sync: (callback: VoidFunction) => {
  //       console.log('sync triggered')
  //       const cleanups = namespaces.map((namespace) =>
  //         subscribe(namespace, callback)
  //       );

  //       return () => {
  //         cleanups.forEach((cleanup) => cleanup());
  //       };
  //     },
  //     getSnapshot: () => {
  //       namespaces.forEach((namespace) => {
  //         const currentValue = store[namespace];

  //         if (currentValue !== prevDataRef.current[namespace]) {
  //           prevDataRef.current = {
  //             ...prevDataRef.current,
  //             [namespace]: currentValue,
  //           };
  //         }
  //       });

  //       return prevDataRef.current;
  //     },
  //   };
  // }, [namespaces, store, subscribe]);
  
  // const vs = useSyncExternalStore(subscription.sync, subscription.getSnapshot);

  // console.log(vs, 'vs')

  return value;
}
