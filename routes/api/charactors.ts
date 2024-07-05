import { Handlers } from "$fresh/server.ts";
import { getKvData } from "../../services/kv.ts";

export const handler: Handlers = {
  GET: async () => {
    return new Response(
      JSON.stringify(
        (await getKvData<string[]>(["charactors"])).value?.map((x) =>
          x.toLowerCase()
        ),
      ),
    );
  },
};
