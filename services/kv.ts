export const openAppKv = () => {
  if (Deno.env.get("CI") === "true") {
    return Deno.openKv();
  } else {
    Deno.mkdirSync("database", { recursive: true });
    return Deno.openKv("database/kv");
  }
};
