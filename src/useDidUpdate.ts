import { useEffect, useRef } from 'react';

export const useDidUpdate = (effect = () => {}, dependencies: any[] = []) => {
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;

      return;
    }

    effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
};
