export const openAppKv = () => {
  // deno task dev_remote時 OR GitHub Actions環境
  if (
    Deno.env.get("CONNECT_REMOTE") === "true" || Deno.env.get("CI") === "true"
  ) {
    if (Deno.env.get("DENO_KV_REMOTE_URL") === undefined) {
      console.error("DENO_KV_REMOTE_URL is missing.");
      Deno.exit(1);
    }
    return Deno.openKv(Deno.env.get("DENO_KV_REMOTE_URL"));
  } // deno deploy環境. see: https://docs.deno.com/deploy/manual/environment-variables#default-environment-variables
  else if (Deno.env.get("DENO_DEPLOYMENT_ID") !== undefined) {
    return Deno.openKv();
  } // ローカル環境
  else {
    Deno.mkdirSync("database", { recursive: true });
    return Deno.openKv("database/kv");
  }
};
export const setKvData = async (prefix: string[], value: unknown) => {
  return (await openAppKv()).set(prefix, value);
};
export const getKvData = async (prefix: string[]) => {
  return (await openAppKv()).get(prefix);
};
