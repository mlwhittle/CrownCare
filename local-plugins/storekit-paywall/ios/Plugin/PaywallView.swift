import SwiftUI
import StoreKit

@available(iOS 17.0, *)
struct PaywallView: View {
    var onDismiss: () -> Void
    
    var body: some View {
        NavigationView {
            SubscriptionStoreView(groupID: "21996977")
                .subscriptionStorePolicyDestination(for: .privacyPolicy) {
                    URL(string: "https://crowncare.app/privacy")!
                }
                .subscriptionStorePolicyDestination(for: .termsOfService) {
                    URL(string: "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/")!
                }
                .storeButton(.visible, for: .policies)
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
    }
}
