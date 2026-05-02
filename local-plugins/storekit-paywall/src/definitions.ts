export interface StoreKitPaywallPlugin {
  presentPaywall(): Promise<{ status: string }>;
}
