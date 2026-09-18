import { createAdminClient } from "@insforge/sdk";

let _adminClient: any = null;

export function getInsforgeAdmin() {
  if (!_adminClient) {
    const baseUrl =
      process.env.INSFORGE_URL ||
      process.env.NEXT_PUBLIC_INSFORGE_URL ||
      "https://ayrxjr89.eu-central.insforge.app";
    const apiKey =
      process.env.INSFORGE_API_KEY ||
      "ik_44e1d79bec5a055c70e2504e4849995e";

    const raw = createAdminClient({
      baseUrl,
      apiKey,
    });

    _adminClient = new Proxy(raw as any, {
      get(target, prop) {
        if (prop === "from") {
          return (...args: any[]) => (target.database as any).from(...args);
        }
        return (target as any)[prop];
      },
    });
  }
  return _adminClient;
}

export const insforgeAdmin = new Proxy({} as any, {
  get(_target, prop) {
    return (getInsforgeAdmin() as any)[prop];
  },
});
