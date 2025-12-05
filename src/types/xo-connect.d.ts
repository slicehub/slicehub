declare module "xo-connect" {
  export class XOConnectProvider {
    constructor(config: {
      rpcs: Record<string, string>;
      defaultChainId: string;
    });

    request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  }
}
