"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../../../contexts/CartContext";
import { useWishlist } from "../../../contexts/WishlistContext";
import { ProductCard } from "../../../components/customer/ProductCard";
import { customerApi } from "../../../../services/customerApi";

export default function DedicatedProductDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    customerApi.getProductDetail(id).then((data) => {
      if (isMounted && data) {
        setProduct(data);
        setSelectedImage(data.images?.[0] || "");
        setSelectedVariant(data.variants?.[0] || null);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 animate-pulse space-y-6">
        <div className="h-96 bg-surface-container rounded-3xl" />
        <div className="h-12 bg-surface-container rounded-full w-1/3" />
        <div className="h-40 bg-surface-container rounded-3xl" />
      </div>
    );
  }

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentOriginalPrice = selectedVariant ? selectedVariant.originalPrice : product.originalPrice;
  const inWish = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart({
      id: `${product.id}-${selectedVariant?.id || "default"}`,
      title: `${product.title} ${selectedVariant ? `(${selectedVariant.name})` : ""}`,
      price: currentPrice,
      originalPrice: currentOriginalPrice,
      weight: selectedVariant?.name || product.unit,
      image: selectedImage || product.images?.[0],
      storeName: product.merchant?.name || "Local Merchant",
      quantity
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/customer/checkout");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 min-h-screen">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-6">
        <Link href="/customer" className="hover:text-primary transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href={`/customer/search?category=${encodeURIComponent(product.category)}`} className="hover:text-primary transition-colors">
          {product.category}
        </Link>
        <span>/</span>
        <span className="font-bold text-on-surface truncate">{product.title}</span>
      </nav>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start mb-16">
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="relative w-full h-[360px] sm:h-[460px] bg-surface-container rounded-3xl border border-surface-container-high shadow-md overflow-hidden flex items-center justify-center p-6 group">
            {product.discountBadge && (
              <span className="absolute top-4 left-4 z-10 bg-error text-on-error font-bold text-xs px-3.5 py-1.5 rounded-full shadow-md">
                {product.discountBadge}
              </span>
            )}
            <button
              type="button"
              onClick={() =>
                toggleWishlist({
                  id: product.id,
                  title: product.title,
                  price: currentPrice,
                  originalPrice: currentOriginalPrice,
                  weight: product.unit,
                  image: selectedImage,
                  storeName: product.merchant?.name
                })
              }
              className={`absolute top-4 right-4 z-10 w-11 h-11 rounded-full flex items-center justify-center shadow-lg border transition-all cursor-pointer ${
                inWish
                  ? "bg-tertiary text-on-tertiary border-tertiary"
                  : "bg-surface-container/90 text-on-surface-variant hover:text-tertiary border-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">
                {inWish ? "favorite" : "favorite_border"}
              </span>
            </button>

            <img
              src={selectedImage}
              alt={product.title}
              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Gallery Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto hide-scrollbar">
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl border-2 p-1 bg-surface-container overflow-hidden flex-shrink-0 transition-all cursor-pointer ${
                    selectedImage === img
                      ? "border-primary shadow-md scale-105"
                      : "border-surface-container-high opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details & Order Box */}
        <div className="flex flex-col space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                {product.subcategory || product.category}
              </span>
              <span className="text-xs text-on-surface-variant">• SKU: {product.sku}</span>
            </div>

            <h1 className="font-headline-lg text-2xl sm:text-4xl font-extrabold text-on-surface leading-tight">
              {product.title}
            </h1>

            {/* Rating Summary */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full text-xs font-bold">
                <span className="material-symbols-outlined text-[16px] text-amber-600">star</span>
                <span>{product.reviewsSummary?.averageRating}</span>
              </div>
              <span className="text-xs font-medium text-on-surface-variant">
                ({product.reviewsSummary?.totalCount} verified reviews)
              </span>
              <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full">
                In Stock ({product.stockQty} left)
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 bg-surface-container-low rounded-3xl border border-surface-container-high flex items-baseline gap-3">
            <span className="font-display text-3xl font-extrabold text-primary">₹{currentPrice}</span>
            {currentOriginalPrice && (
              <span className="text-sm font-semibold text-on-surface-variant/60 line-through">
                ₹{currentOriginalPrice}
              </span>
            )}
            <span className="text-xs font-bold text-tertiary ml-auto">Inclusive of all taxes</span>
          </div>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
                Select Option / Pack Size
              </label>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((varOpt: any) => (
                  <button
                    key={varOpt.id}
                    type="button"
                    onClick={() => setSelectedVariant(varOpt)}
                    className={`px-4 py-2.5 rounded-2xl font-label-md text-xs font-semibold transition-all border cursor-pointer ${
                      selectedVariant?.id === varOpt.id
                        ? "bg-primary text-on-primary border-primary shadow-xs"
                        : "bg-surface-container text-on-surface border-surface-container-high hover:bg-surface-container"
                    }`}
                  >
                    <span>{varOpt.name}</span>
                    <span className="ml-2 opacity-80">₹{varOpt.price}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            {/* Stepper */}
            <div className="flex items-center border border-surface-container-high bg-surface-container rounded-full p-1.5 shadow-xs">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface font-bold cursor-pointer"
              >
                -
              </button>
              <span className="w-12 text-center font-bold text-sm text-on-surface">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface font-bold cursor-pointer"
              >
                +
              </button>
            </div>

            {/* Add to Cart */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 py-4 bg-primary text-on-primary font-bold text-sm rounded-full shadow-lg hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
              <span>Add to Cart (₹{currentPrice * quantity})</span>
            </button>

            {/* Buy Now */}
            <button
              type="button"
              onClick={handleBuyNow}
              className="px-6 py-4 bg-tertiary text-on-tertiary font-bold text-sm rounded-full shadow-md hover:bg-tertiary-container transition-all cursor-pointer"
            >
              Buy Now
            </button>
          </div>

          {/* Merchant Profile Preview Card */}
          {product.merchant && (
            <div className="bg-surface-container rounded-3xl p-5 border border-surface-container-high shadow-xs flex items-center justify-between gap-4 mt-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary font-bold text-lg flex items-center justify-center">
                  {product.merchant.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-on-surface">{product.merchant.name}</h4>
                  <p className="text-xs text-on-surface-variant">
                    ★ {product.merchant.rating} • {product.merchant.distance}
                  </p>
                </div>
              </div>

              <Link
                href={`/customer/stores/${product.merchant.id}`}
                className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs rounded-full border border-surface-container-high transition-colors"
              >
                Visit Store
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Tabs: Description, Specs, Reviews */}
      <div className="bg-surface-container rounded-3xl p-6 sm:p-8 border border-surface-container-high shadow-xs mb-16">
        <div className="flex gap-4 border-b border-surface-container-high pb-4 mb-6">
          {(["description", "specs", "reviews"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full font-label-md text-xs font-bold capitalize transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-primary text-on-primary shadow-xs"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {tab === "description" ? "Description" : tab === "specs" ? "Specifications" : "Customer Reviews"}
            </button>
          ))}
        </div>

        {activeTab === "description" && (
          <div className="prose max-w-none text-sm text-on-surface-variant leading-relaxed">
            <p>{product.description}</p>
          </div>
        )}

        {activeTab === "specs" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {product.specs?.map((spec: any, idx: number) => (
              <div key={idx} className="flex justify-between p-3.5 bg-surface-container-low rounded-2xl border border-surface-container-high text-xs">
                <span className="font-bold text-on-surface-variant">{spec.label}</span>
                <span className="font-semibold text-on-surface">{spec.value}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-6">
            {product.reviews?.map((rev: any) => (
              <div key={rev.id} className="p-4 bg-surface-container-low rounded-2xl border border-surface-container-high space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                      {rev.userAvatar}
                    </div>
                    <span className="font-bold text-xs text-on-surface">{rev.userName}</span>
                  </div>
                  <span className="text-xs text-on-surface-variant">{rev.date}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500 text-xs">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-[16px]">star</span>
                  ))}
                </div>
                <p className="text-xs text-on-surface leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Products Grid */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <section className="w-full">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-headline-lg text-2xl font-bold text-on-surface">Related Products Nearby</h3>
            <Link href="/customer/search" className="text-xs font-bold text-primary hover:underline">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {product.relatedProducts.map((prod: any) => (
              <ProductCard key={prod.id} {...prod} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
