import { useEffect } from "preact/hooks";
import { useSignal } from "@preact/signals";

export default function UpdateHistory() {
  const history = useSignal<Date | null>(null);
  useEffect(() => {
    (async () => {
      console.log("fetch update history.");
      const resp = await fetch("/api/updateHistory");
      const json: Date = await resp.json();
      history.value = new Date(json);
    })();
  }, [history]);

  return <>updated: {history}</>;
}
