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
                .navigationTitle("Choose a Plan")
                .navigationBarTitleDisplayMode(.inline)
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
