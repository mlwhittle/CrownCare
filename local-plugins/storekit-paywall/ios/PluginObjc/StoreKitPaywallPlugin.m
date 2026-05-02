#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(StoreKitPaywallPlugin, "StoreKitPaywall",
    CAP_PLUGIN_METHOD(presentPaywall, CAPPluginReturnPromise);
)
