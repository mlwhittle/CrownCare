import { registerPlugin } from '@capacitor/core';
import type { StoreKitPaywallPlugin } from './definitions';

const StoreKitPaywall = registerPlugin<StoreKitPaywallPlugin>('StoreKitPaywall');

export * from './definitions';
export { StoreKitPaywall };
