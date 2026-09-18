import { createClient } from "@insforge/sdk";

let _client: any = null;

export function getInsforge() {
  if (!_client) {
    const baseUrl =
      process.env.NEXT_PUBLIC_INSFORGE_URL ||
      process.env.INSFORGE_URL ||
      "https://ayrxjr89.eu-central.insforge.app";
    const anonKey =
      process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY ||
      "anon_8d0d91ec347066156f9dbdcaee1c20c79efff1024bfbe42a112e54877de4c0a5";

    const raw = createClient({
      baseUrl,
      anonKey,
    });

    _client = new Proxy(raw as any, {
      get(target, prop) {
        if (prop === "from") {
          return (...args: any[]) => (target.database as any).from(...args);
        }
        return (target as any)[prop];
      },
    });
  }
  return _client;
}

export const insforge = new Proxy({} as any, {
  get(_target, prop) {
    return (getInsforge() as any)[prop];
  },
});
