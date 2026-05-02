import Foundation
import Capacitor
import SwiftUI

@objc(StoreKitPaywallPlugin)
public class StoreKitPaywallPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "StoreKitPaywallPlugin"
    public let jsName = "StoreKitPaywall"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "presentPaywall", returnType: CAPPluginReturnPromise)
    ]
    
    @objc func presentPaywall(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if #available(iOS 17.0, *) {
                let paywallView = PaywallView(onDismiss: {
                    self.bridge?.viewController?.dismiss(animated: true) {
                        call.resolve([ "status": "closed" ])
                    }
                })
                
                let hostingController = UIHostingController(rootView: paywallView)
                hostingController.modalPresentationStyle = .pageSheet
                
                self.bridge?.viewController?.present(hostingController, animated: true)
            } else {
                call.reject("SubscriptionStoreView requires iOS 17.0 or newer.")
            }
        }
    }
}
