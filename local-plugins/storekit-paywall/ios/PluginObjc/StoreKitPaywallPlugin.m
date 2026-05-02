#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

@interface StoreKitPaywallPlugin : CAPPlugin
@end

CAP_PLUGIN(StoreKitPaywallPlugin, "StoreKitPaywall",
    CAP_PLUGIN_METHOD(presentPaywall, CAPPluginReturnPromise);
)
