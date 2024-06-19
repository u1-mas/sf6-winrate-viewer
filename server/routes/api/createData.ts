import { FreshContext } from "$fresh/server.ts";

export const handler = async (
    _req: Request,
    _ctx: FreshContext,
): Promise<Response> => {
    const cmd = new Deno.Command(Deno.execPath(), {
        args: ["deno", "task", "create_data"],
        stdout: "piped",
    });
    const { code, stdout, stderr } = await cmd.output();
    console.log(new TextDecoder().decode(stdout));
    return new Response(JSON.stringify({ ok: "ok" }));
};
