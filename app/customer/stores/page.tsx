"use client";

import React, { useState, useEffect } from "react";
import { StoreCard } from "../../components/customer/StoreCard";
import { StoresMap } from "../../components/customer/StoresMap";
import { customerApi, Store } from "../../../services/customerApi";

const PRIMARY = "#748F70";
const SURFACE = "#141A15";
const SURFACE_C = "#1A231C";
const SURFACE_CH = "#243026";
const ON_SURFACE = "#F2F7F2";
const ON_SURFACE_VAR = "#C2D6C0";

export default function CustomerStoresListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRadius, setSelectedRadius] = useState<number>(5);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [userLat, setUserLat] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bazaar_user_lat");
      if (saved) return parseFloat(saved);
    }
    return 17.4156; // Banjara Hills fallback
  });
  const [userLng, setUserLng] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bazaar_user_lng");
      if (saved) return parseFloat(saved);
    }
    return 78.4347; // Banjara Hills fallback
  });
  const [userLocationName, setUserLocationName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bazaar_user_location");
      if (saved) return saved;
    }
    return "Banjara Hills, Hyderabad";
  });
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleLocationChange = (e: any) => {
        if (e.detail?.lat && e.detail?.lng) {
          setUserLat(e.detail.lat);
          setUserLng(e.detail.lng);
        }
        if (e.detail?.locationString) {
          setUserLocationName(e.detail.locationString);
        }
      };

      window.addEventListener("bazaar_location_changed", handleLocationChange);
      return () => window.removeEventListener("bazaar_location_changed", handleLocationChange);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    customerApi
      .getStoresByDistance({
        lat: userLat,
        lng: userLng,
        radius: selectedRadius,
        category: selectedCategory
      })
      .then((data) => {
        if (isMounted) {
          setStores(data);
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [selectedRadius, selectedCategory, userLat, userLng]);

  const filteredStores = stores.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ background: SURFACE, color: ON_SURFACE, minHeight: "100vh", fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 40px 80px" }}>
        {/* Page Header */}
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 24, marginBottom: 32, paddingBottom: 24, borderBottom: `1px solid ${SURFACE_CH}`, flexWrap: "wrap" }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, color: PRIMARY, textTransform: "uppercase", letterSpacing: "0.12em" }}>
              Distance-Based Discovery
            </span>
            <h1 style={{ margin: "4px 0 0", fontSize: 32, fontWeight: 900, color: ON_SURFACE, letterSpacing: "-0.02em" }}>
              Local Stores & Neighborhood Markets
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: ON_SURFACE_VAR }}>
              Browse verified local stores, sweet shops, bakeries, and markets near {userLocationName}
            </p>
          </div>

          <div style={{ position: "relative", minWidth: 280 }}>
            <span className="material-symbols-outlined" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: ON_SURFACE_VAR, fontSize: 20 }}>
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search store by name..."
              style={{
                width: "100%", height: 44, paddingLeft: 46, paddingRight: 16,
                background: SURFACE_C, border: `1px solid ${SURFACE_CH}`,
                borderRadius: 999, fontSize: 13, color: ON_SURFACE, outline: "none"
              }}
            />
          </div>
        </div>

        {/* Interactive Stores Map with Radius Circle */}
        <StoresMap
          stores={stores}
          userLat={userLat}
          userLng={userLng}
          selectedRadius={selectedRadius}
          onRadiusChange={setSelectedRadius}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Stores Directory Section */}
        <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: ON_SURFACE }}>
            Shops within {selectedRadius} km ({filteredStores.length})
          </h2>
          <span style={{ fontSize: 12, color: ON_SURFACE_VAR, fontWeight: 600 }}>Sorted Nearest First</span>
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
            {[1, 2, 3].map((n) => (
              <div key={n} style={{ height: 260, borderRadius: 28, background: SURFACE_C, animation: "shimmer 1.4s ease infinite" }} />
            ))}
          </div>
        ) : filteredStores.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
            {filteredStores.map((store) => (
              <StoreCard key={store.id} {...store} />
            ))}
          </div>
        ) : (
          <div style={{ borderRadius: 28, background: SURFACE_C, border: `1px solid ${SURFACE_CH}`, padding: 48, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 44, color: ON_SURFACE_VAR, opacity: 0.4, marginBottom: 8 }}>
              storefront
            </span>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: ON_SURFACE }}>No stores found in radius</h3>
            <p style={{ margin: "6px 0 16px", fontSize: 13, color: ON_SURFACE_VAR, maxWidth: 320 }}>
              Try expanding your search radius to 5 km or 10 km to see more neighborhood shops.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedRadius(10);
                setSelectedCategory("All");
              }}
              style={{
                padding: "10px 24px", background: PRIMARY, color: "#fff",
                fontWeight: 700, fontSize: 13, borderRadius: 999, border: "none", cursor: "pointer"
              }}
            >
              Expand Radius to 10 km
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
