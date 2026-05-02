// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "capacitor-storekit-paywall",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapacitorStorekitPaywall",
            targets: ["StoreKitPaywallPlugin", "StoreKitPaywallPluginObjc"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", branch: "main")
    ],
    targets: [
        .target(
            name: "StoreKitPaywallPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Plugin"),
        .target(
            name: "StoreKitPaywallPluginObjc",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/PluginObjc")
    ]
)
