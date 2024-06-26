export const openAppKv = () => {
  // see: https://docs.deno.com/deploy/manual/environment-variables#default-environment-variables
  if (Deno.env.get("CONNECT_REMOTE") === "true") {
    if (Deno.env.get("DENO_KV_REMOTE_URL") === undefined) {
      console.error("DENO_KV_REMOTE_URL is missing.");
      Deno.exit(1);
    }
    return Deno.openKv(Deno.env.get("DENO_KV_REMOTE_URL"));
  } else if (Deno.env.get("DENO_DEPLOYMENT_ID") !== undefined) {
    return Deno.openKv();
  } else {
    Deno.mkdirSync("database", { recursive: true });
    return Deno.openKv("database/kv");
  }
};
