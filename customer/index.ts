// Re-exports for customer portal pages and shared components
export { default as CustomerHomePage } from "../app/customer/page";
export { default as CustomerDiscoverPage } from "../app/customer/discover/page";
export { default as CustomerSearchPage } from "../app/customer/search/page";
export { default as CustomerStoresListPage } from "../app/customer/stores/page";
export { default as CustomerStoreDetailPage } from "../app/customer/stores/[id]/page";
export { default as CustomerCartPage } from "../app/customer/cart/page";
export { default as CustomerCheckoutPage } from "../app/customer/checkout/page";
export { default as CustomerOrderConfirmedPage } from "../app/customer/order-confirmation/page";
export { default as CustomerTrackingPage } from "../app/customer/tracking/page";
export { default as CustomerOrdersPage } from "../app/customer/orders/page";
export { default as CustomerWishlistPage } from "../app/customer/wishlist/page";
export { default as CustomerOffersPage } from "../app/customer/offers/page";
export { default as CustomerAccountPage } from "../app/customer/account/page";
export { default as CustomerHelpPage } from "../app/customer/help/page";

export * from "../app/components/customer/CustomerHeader";
export * from "../app/components/customer/CustomerNavbar";
export * from "../app/components/customer/MobileNavigation";
export * from "../app/components/customer/CustomerFooter";
export * from "../app/components/customer/ProductCard";
export * from "../app/components/customer/StoreCard";
export * from "../app/contexts/CartContext";
export * from "../app/contexts/WishlistContext";
