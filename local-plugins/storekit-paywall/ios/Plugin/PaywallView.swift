import SwiftUI
import StoreKit

@available(iOS 17.0, *)
struct PaywallView: View {
    var onDismiss: () -> Void
    
    var body: some View {
        NavigationView {
            SubscriptionStoreView(productIDs: ["crowncare_solo_monthly", "crowncare_connected_monthly", "crowncare_pro_monthly"])
                .subscriptionStorePolicyDestination(for: .privacyPolicy) {
                    URL(string: "https://crowncare.app/privacy")!
                }
                .subscriptionStorePolicyDestination(for: .termsOfService) {
                    URL(string: "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/")!
                }
                .storeButton(.visible, for: .policies)
                .navigationTitle("Choose a Plan")
                .navigationBarTitleDisplayMode(.inline)
                .onInAppPurchaseCompletion { product, result in
                    switch result {
                    case .success(let successResult):
                        print("CrownCare StoreKit Purchase success: \(successResult)")
                    case .failure(let error):
                        print("CrownCare StoreKit Purchase error: \(error.localizedDescription)")
                    }
                }
                .toolbar {
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Button("Close") {
                            onDismiss()
                        }
                    }
                }
        }
        .onDisappear {
            onDismiss()
        }
    }
}
