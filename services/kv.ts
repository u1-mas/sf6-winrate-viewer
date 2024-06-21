export const openAppKv = () => {
  // see: https://docs.deno.com/deploy/manual/environment-variables#default-environment-variables
  if (Deno.env.get("DENO_DEPLOYMENT_ID") !== undefined) {
    return Deno.openKv();
  } else {
    Deno.mkdirSync("database", { recursive: true });
    return Deno.openKv("database/kv");
  }
};
