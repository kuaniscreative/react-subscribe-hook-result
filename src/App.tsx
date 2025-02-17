/* eslint-disable react-hooks/rules-of-hooks */
import { useState } from "react";
import SubscriptionProvider from "./SubscriptionProvider";
import { useHookResults } from "./useHookResults";

function A() {
  const results = useHookResults(["state-aaaa"])
  const [a, setA] = results['state-aaaa'] || [];

  console.log(results)

  return <button onClick={() => setA(a + "a")}>change a state</button>;
}

function B() {
  const results = useHookResults(["state-bbbb"])
  const [b, setB] = results['state-bbbb'] || [];

  console.log(results)

  return <button onClick={() => setB(b + "b")}>change b state</button>;
}

const hooks = {
  "state-aaaa": {
    use: () => {
      return useState("a")
    }
  },
  "state-bbbb": {
    use: () => {
      return useState("b")
    },
  },
}

export default function App() {
  return (
    <SubscriptionProvider hooks={hooks}>
      <A />
      <B />
    </SubscriptionProvider>
  );
}
