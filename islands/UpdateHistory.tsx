import { useEffect } from "preact/hooks";
import { useSignal } from "@preact/signals";

export default function UpdateHistory() {
  const history = useSignal<Date | null>(null);
  useEffect(() => {
    (async () => {
      console.log("fetch update history.");
      const resp = await fetch("http://localhost:8000/api/updateHistory");
      const json: Date = await resp.json();
      history.value = json;
    })();
  }, [history]);

  return <>updated: {history}</>;
}