import { describe, expect, it } from "vitest";
import type { ConfigEnv, ProxyOptions, UserConfig } from "vite";

import viteConfig from "../../vite.config.js";

async function resolveServerConfig() {
  const config =
    typeof viteConfig === "function"
      ? viteConfig({ command: "serve", mode: "test", isSsrBuild: false, isPreview: false } satisfies ConfigEnv)
      : viteConfig;

  return (await Promise.resolve(config)) satisfies UserConfig;
}

function asProxyOptions(proxyEntry: string | ProxyOptions | undefined) {
  expect(proxyEntry).toBeTypeOf("object");
  return proxyEntry as ProxyOptions;
}

describe("vite dev proxy", () => {
  it("targets the dedicated dev backend port by default", async () => {
    const serverConfig = await resolveServerConfig();
    const apiProxy = asProxyOptions(serverConfig.server?.proxy?.["/api"]);

    expect(apiProxy).toMatchObject({
      target: "http://localhost:3002",
      changeOrigin: true
    });
  });

  it("proxies managed generated asset requests to the backend target", async () => {
    const serverConfig = await resolveServerConfig();
    const proxy = serverConfig.server?.proxy;
    const apiProxy = asProxyOptions(proxy?.["/api"]);
    const generatedAssetsProxy = asProxyOptions(proxy?.["/generated-assets"]);

    expect(apiProxy).toBeDefined();
    expect(generatedAssetsProxy).toBeDefined();
    expect(generatedAssetsProxy).toMatchObject({
      target: apiProxy.target,
      changeOrigin: true
    });
  });
});
