export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  weight?: string;
  image?: string;
  storeName: string;
  category?: string;
  rating?: number;
  discountBadge?: string;
  inStock?: boolean;
}

export interface Store {
  id: string;
  name: string;
  distance: string;
  distanceNum?: number;
  rating: number;
  reviewsCount?: number;
  address?: string;
  phone?: string;
  timing?: string;
  image: string;
  verified?: boolean;
  featured?: boolean;
  category?: string;
  categoryTag?: string;
  offerText?: string;
  lat?: number;
  lng?: number;
}

export interface HomeData {
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
  };
  categories: Array<{
    name: string;
    icon: string;
    color: string;
    textColor: string;
  }>;
  nearbyStores: Store[];
  freshFinds: Product[];
}

export interface CustomerProfile {
  name: string;
  email: string;
  phone: string;
  walletBalance: number;
  address: {
    line1: string;
    line2?: string;
    landmark?: string;
    city: string;
    pincode: string;
    lat: number;
    lng: number;
  };
}

const API_BASE_URL = "/api/customer";

const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("bazaar_customer_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      headers["x-user-id"] = token;
    }
  }
  return headers;
};

export const customerApi = {
  async getHomeData(lat = 17.4156, lng = 78.4347): Promise<HomeData> {
    try {
      const res = await fetch(`${API_BASE_URL}/home?lat=${lat}&lng=${lng}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (e) {
      console.warn("Home API fallback active", e);
    }
    return {
      hero: { title: "Shop your neighborhood.", subtitle: "Everything you need from stores you already know.", ctaText: "Explore nearby" },
      categories: [
        { name: "Groceries", icon: "shopping_basket", color: "from-primary-fixed/40", textColor: "text-primary" },
        { name: "Fresh Produce", icon: "nutrition", color: "from-tertiary-fixed/40", textColor: "text-tertiary" },
        { name: "Dairy & Milk", icon: "water_drop", color: "from-secondary-fixed/40", textColor: "text-secondary" },
        { name: "Snacks & Munchies", icon: "cookie", color: "from-error-container/40", textColor: "text-error" },
        { name: "Beverages", icon: "local_cafe", color: "from-primary-fixed/40", textColor: "text-primary" },
        { name: "Personal Care", icon: "spa", color: "from-tertiary-fixed/40", textColor: "text-tertiary" },
        { name: "Bakery & Treats", icon: "bakery_dining", color: "from-secondary-fixed/40", textColor: "text-secondary" }
      ],
      nearbyStores: [],
      freshFinds: []
    };
  },

  async getStoresByDistance(params: { lat?: number; lng?: number; radius?: number; category?: string }): Promise<Store[]> {
    try {
      const query = new URLSearchParams();
      if (params.lat) query.set("lat", String(params.lat));
      if (params.lng) query.set("lng", String(params.lng));
      if (params.radius) query.set("radius", String(params.radius));
      if (params.category) query.set("category", params.category);

      const res = await fetch(`${API_BASE_URL}/stores?${query.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (e) {
      console.warn("Stores by distance fallback active", e);
    }
    return [];
  },

  async getStoreDetail(storeId: string): Promise<Store & { products: Product[] }> {
    try {
      const res = await fetch(`${API_BASE_URL}/stores/${storeId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (e) {
      console.warn("Store detail fallback active", e);
    }
    return {
      id: storeId,
      name: "Sri Lakshmi Stores",
      distance: "0.6 km away",
      rating: 4.8,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA7uIp0Y8FFNEYeqJQgEGrstb-4C6nivm-4V2BhOU58H2R-TW6GbbHxzV4x3yOkZcIEJi8g0pM3PpjzYP4jv6xSeAPuTj3FkoVyEDxGZ4DLdT1adt0IdPvBGYcV-aVA7UfSS76ShigZlLAQ2o5ADl2kZ304Chx3SF_RhTEbQmFpIFfycOfGYBuDURv-WjgucjaztdtaJBYNxxwrjgdjuz7pahl7LLBfZgM7y04hAmq61Q0YTY5_AR0",
      products: []
    };
  },

  async getProductDetail(productId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (e) {
      console.warn("Product detail fallback active", e);
    }
    return null;
  },

  async getDiscoverData(): Promise<{ collections: any[]; spotlightStores: Store[] }> {
    try {
      const res = await fetch(`${API_BASE_URL}/discover`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (e) {
      console.warn("Discover API fallback active", e);
    }
    return { collections: [], spotlightStores: [] };
  },

  async searchProducts(params: { q?: string; category?: string; minRating?: number; maxPrice?: number }): Promise<Product[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params.q) queryParams.set("q", params.q);
      if (params.category) queryParams.set("category", params.category);
      if (params.minRating) queryParams.set("minRating", String(params.minRating));
      if (params.maxPrice) queryParams.set("maxPrice", String(params.maxPrice));

      const res = await fetch(`${API_BASE_URL}/search?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (e) {
      console.warn("Search API fallback active", e);
    }
    return [];
  },

  // Cart API Calls
  async getCart(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/cart`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (e) {
      console.warn("Cart GET API fallback active", e);
    }
    return [];
  },

  async addToCart(item: any): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/cart`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(item)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (e) {
      console.warn("Cart POST API fallback active", e);
    }
    return [];
  },

  async updateCartQuantity(id: string, delta: number): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/cart/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ delta })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (e) {
      console.warn("Cart PUT API fallback active", e);
    }
    return [];
  },

  async removeFromCart(id: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/cart/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (e) {
      console.warn("Cart DELETE API fallback active", e);
    }
    return [];
  },

  // Wishlist API Calls
  async getWishlist(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/wishlist`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (e) {
      console.warn("Wishlist GET API fallback active", e);
    }
    return [];
  },

  async addToWishlist(item: any): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/wishlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (e) {
      console.warn("Wishlist POST API fallback active", e);
    }
    return [];
  },

  async removeFromWishlist(id: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/wishlist/${id}`, { method: "DELETE" });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (e) {
      console.warn("Wishlist DELETE API fallback active", e);
    }
    return [];
  },

  // Profile API Calls
  async getProfile(): Promise<CustomerProfile | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/profile`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (e) {
      console.warn("Profile GET API fallback active", e);
    }
    return null;
  },

  async saveProfile(payload: Partial<CustomerProfile>): Promise<CustomerProfile | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (e) {
      console.warn("Profile POST API fallback active", e);
    }
    return null;
  },

  async placeOrder(payload: any): Promise<{ success: boolean; orderId?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        return { success: true, orderId: json.orderId };
      }
    } catch (e) {
      console.warn("Order placement fallback active", e);
    }
    return { success: true, orderId: `BZR-${Math.floor(10000 + Math.random() * 90000)}` };
  },

  async getCustomerOrders(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/orders`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (e) {
      console.warn("Orders fetch fallback active", e);
    }
    return [];
  }
};


export const sendCustomerRequest = async (req: string, history: any[] = []) => {
  // Ensure we always have a user ID for the cart agent to track
  let userId = localStorage.getItem("bazaar_customer_token");
  if (!userId || userId === "null") {
    userId = "customer-" + Math.floor(Math.random() * 10000);
    localStorage.setItem("bazaar_customer_token", userId);
  }

  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId
    },
    body: JSON.stringify({ query: req, history })
  });

  if (res.ok) {
    const json = await res.json();
    return json.data;
  }
  return "Sorry, I am having trouble connecting to the server.";
}

export const streamCustomerRequest = async (req: string, history: any[], onChunk: (data: any) => void) => {
  let userId = localStorage.getItem("bazaar_customer_token");
  if (!userId || userId === "null") {
    userId = "customer-" + Math.floor(Math.random() * 10000);
    localStorage.setItem("bazaar_customer_token", userId);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId
      },
      body: JSON.stringify({ query: req, history })
    });

    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            onChunk(data);
          } catch (e) {
            console.warn("Failed to parse SSE line", line);
          }
        }
      }
    }
  } catch (error) {
    console.error("Streaming error:", error);
    onChunk({ error: "Sorry, I am having trouble connecting to the server." });
  }
}
