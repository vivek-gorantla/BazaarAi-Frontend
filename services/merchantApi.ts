const API_BASE_URL = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');

const getMerchantToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem("merchant_token") || 'merchant-123';
  }
  return 'merchant-123';
};

const getStoreId = async () => {
  try {
    const token = getMerchantToken();
    const res = await fetch(`${API_BASE_URL}/api/merchant/stores`, { headers: { 'x-user-id': token, 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    if (data.success && data.data && data.data.length > 0) {
      return data.data[0].id;
    }
  } catch (e) {
    console.error("Failed to fetch stores", e);
  }
  return '';
};

// Simulated network delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface DashboardMetrics {
  title: string;
  value: string;
  inc: string;
  iconKey: string;
  color: string;
}

export interface TrendingProduct {
  title: string;
  sales: string;
  inc: string;
  price: string;
  img: string;
}

export interface DashboardData {
  metrics: DashboardMetrics[];
  trendingProducts: TrendingProduct[];
}

export const getDashboardData = async (): Promise<DashboardData> => {
  const storeId = await getStoreId();
  if (!storeId) {
    throw new Error("No store found");
  }
  const res = await fetch(`${API_BASE_URL}/api/merchant/stores/${storeId}/dashboard`, { headers: { 'x-user-id': getMerchantToken() } });
  const data = await res.json();
  if (data.success) {
    return data.data;
  }
  throw new Error("Failed to fetch dashboard");
};


export interface Product {
  id: string;
  status: "Healthy Stock" | "Low Stock" | "Out of Stock";
  image: string;
  category: string;
  subcategory?: string;
  title: string;
  price: string;
  numericPrice: number;
  unit: string;
  stockQty: number;
  sku?: string;
  description?: string;
  isActive: boolean;
  trendType: "up" | "down";
  trendValue: string;
}

export const getProducts = async (): Promise<Product[]> => {
  const storeId = await getStoreId();
  if (!storeId) return [];
  const res = await fetch(`${API_BASE_URL}/api/catalog/${storeId}?limit=100`, { headers: { 'x-user-id': getMerchantToken() } });
  const json = await res.json();
  if (json.success && json.data) {
    return json.data.map((p: any) => ({
      id: p.id,
      status: Number(p.stockQty) > 10 ? "Healthy Stock" : Number(p.stockQty) > 0 ? "Low Stock" : "Out of Stock",
      image: p.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60',
      category: p.category || 'General',
      subcategory: p.subcategory || '',
      title: p.name,
      price: "₹" + p.price,
      numericPrice: Number(p.price) || 0,
      unit: p.unit || 'piece',
      stockQty: Number(p.stockQty) || 0,
      sku: p.sku || '',
      description: p.description || '',
      isActive: p.isActive !== false,
      trendType: "up",
      trendValue: "+12%"
    }));
  }
  return [];
};



export interface Order {
  id: string;
  customerInitials: string;
  customerName: string;
  customerPhone: string;
  customerColorClass: string;
  productsSummary: string;
  itemsCount: string;
  total: string;
  paymentMethod: string;
  paymentIcon: string;
  paymentIconColor: string;
  status: string;
  statusClass: string;
  time: string;
}

export const getOrders = async (): Promise<Order[]> => {
  const storeId = await getStoreId();
  const res = await fetch(`${API_BASE_URL}/api/merchant/${storeId}/orders`, { headers: { 'x-user-id': getMerchantToken() } });
  const json = await res.json();
  if (json.success && json.data) {
    return json.data.map((o: any) => ({
      id: "#" + o.id.slice(0, 8),
      customerInitials: o.buyer?.name?.substring(0, 2).toUpperCase() || "C",
      customerName: o.buyer?.name || "Customer",
      customerPhone: o.buyer?.phone || "",
      customerColorClass: "bg-secondary-fixed text-on-secondary-fixed",
      productsSummary: o.orderItems?.map((i:any) => i.product?.name).join(', ') || "",
      itemsCount: (o.orderItems?.length || 0) + " items",
      total: "₹" + o.totalAmount,
      paymentMethod: o.payment?.method || "CASH",
      paymentIcon: "money",
      paymentIconColor: "text-secondary",
      status: o.status.toUpperCase(),
      statusClass: "bg-primary-fixed text-on-primary-fixed",
      time: new Date(o.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }));
  }
  throw new Error("Failed to fetch orders");
};



export interface InventoryItem {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  category: string;
  subcategory?: string;
  price: string;
  numericPrice: number;
  units: number;
  unit: string;
  sku: string;
  unitColorClass: string;
  velocity: string;
  velocityIcon: string;
  velocityColorClass: string;
  status: string;
  statusClass: string;
  actionIcon: string;
  actionHoverClass: string;
  isGrayscale?: boolean;
  hasNotification?: boolean;
  description?: string;
}

export interface InventoryData {
  summary: {
    total: number;
    healthy: number;
    lowStock: number;
    outOfStock: number;
  };
  items: InventoryItem[];
}

export const getInventoryData = async (): Promise<InventoryData> => {
  try {
    const storeId = await getStoreId();
    if (storeId) {
      const token = getMerchantToken();
      const res = await fetch(`${API_BASE_URL}/api/catalog/${storeId}?limit=100`, {
        headers: { 'x-user-id': token }
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const rawProducts = json.data;
        let healthy = 0;
        let lowStock = 0;
        let outOfStock = 0;

        const items: InventoryItem[] = rawProducts.map((p: any) => {
          const qty = Number(p.stockQty) || 0;
          let status = "Healthy";
          let statusClass = "bg-primary-fixed text-on-primary-fixed";
          let unitColorClass = "text-on-surface";
          let actionIcon = "edit";
          let actionHoverClass = "hover:bg-primary hover:text-on-primary";
          let isGrayscale = false;
          let hasNotification = false;

          if (qty <= 0) {
            status = "Out of Stock";
            statusClass = "bg-error-container text-on-error-container";
            unitColorClass = "text-error";
            actionIcon = "add_shopping_cart";
            actionHoverClass = "hover:bg-error hover:text-on-error";
            isGrayscale = true;
            hasNotification = true;
            outOfStock++;
          } else if (qty <= 10) {
            status = "Low Stock";
            statusClass = "bg-secondary-container text-on-secondary-container";
            unitColorClass = "text-secondary";
            actionIcon = "add_shopping_cart";
            actionHoverClass = "hover:bg-secondary hover:text-on-secondary";
            lowStock++;
          } else {
            healthy++;
          }

          return {
            id: p.id,
            image: p.imageUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60",
            title: p.name,
            subtitle: `${p.category || 'General'} ${p.sku ? '• SKU-' + p.sku : ''}`,
            category: p.category || 'General',
            subcategory: p.subcategory || '',
            price: "₹" + p.price,
            numericPrice: Number(p.price) || 0,
            units: qty,
            unit: p.unit || 'piece',
            sku: p.sku || '',
            unitColorClass,
            velocity: `${Math.floor(Math.random() * 8 + 1)} / day`,
            velocityIcon: qty > 0 ? "trending_up" : "",
            velocityColorClass: qty > 10 ? "text-secondary" : "text-outline",
            status,
            statusClass,
            actionIcon,
            actionHoverClass,
            isGrayscale,
            hasNotification,
            description: p.description || ''
          };
        });

        return {
          summary: {
            total: items.length,
            healthy,
            lowStock,
            outOfStock
          },
          items
        };
      }
    }
  } catch (err) {
    console.error("Failed to fetch live inventory data", err);
  }

  return {
    summary: { total: 0, healthy: 0, lowStock: 0, outOfStock: 0 },
    items: []
  };
};

export const createProductApi = async (productData: any) => {
  const storeId = await getStoreId();
  const token = getMerchantToken();
  const res = await fetch(`${API_BASE_URL}/api/catalog/${storeId}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': token
    },
    body: JSON.stringify(productData)
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error?.message || "Failed to create product");
  return json.data;
};

export const updateProductApi = async (productId: string, productData: any) => {
  const token = getMerchantToken();
  const res = await fetch(`${API_BASE_URL}/api/catalog/products/${productId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': token
    },
    body: JSON.stringify(productData)
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error?.message || "Failed to update product");
  return json.data;
};

export const updateStockApi = async (productId: string, stockQty: number) => {
  const token = getMerchantToken();
  const res = await fetch(`${API_BASE_URL}/api/inventory/products/${productId}/stock`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': token
    },
    body: JSON.stringify({ stockQty })
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error?.message || "Failed to update stock");
  return json.data;
};

export const deleteProductApi = async (productId: string) => {
  const token = getMerchantToken();
  const res = await fetch(`${API_BASE_URL}/api/catalog/products/${productId}`, {
    method: 'DELETE',
    headers: {
      'x-user-id': token
    }
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error?.message || "Failed to delete product");
  return json;
};

export const bulkCreateProductsApi = async (productsArray: any[]) => {
  const storeId = await getStoreId();
  const token = getMerchantToken();
  const res = await fetch(`${API_BASE_URL}/api/catalog/${storeId}/products/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': token
    },
    body: JSON.stringify(productsArray)
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error?.message || "Failed to bulk import products");
  return json.data;
};



export interface TopProduct {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  revenue: string;
  trendValue: string;
  trendIcon: string;
  trendClass: string;
}

export interface AnalyticsData {
  revenue: {
    total: string;
    increase: string;
    peakDay: string;
  };
  insight: {
    title: string;
    descriptionHtml: string;
  };
  topProducts: TopProduct[];
  customers: {
    total: string;
    newPercentage: string;
  };
}

export const getAnalyticsData = async (): Promise<AnalyticsData> => {
  await delay(500);
  return {
    revenue: {
      total: "$24,892",
      increase: "+14.2%",
      peakDay: "$1,420"
    },
    insight: {
      title: "Smart Insight",
      descriptionHtml: "Your weekend sales are <strong class=\"font-bold\">24% higher</strong> than weekdays. Consider launching a Friday morning promotion to capture early demand."
    },
    topProducts: [
      {
        id: "1",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB23J8N2wZ8rVXZVXYqQY-h1R5B6P0eS5wX5V5Y8gR5V5Y8gR5V5Y8gR5V5Y8gR5V5Y8gR5V5Y8gR5V5",
        title: "Artisan Sourdough",
        subtitle: "Bakery � 142 units",
        revenue: "$1,136",
        trendValue: "12%",
        trendIcon: "trending_up",
        trendClass: "text-primary bg-primary-container/50"
      },
      {
        id: "2",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB23J8N2wZ8rVXZVXYqQY-h1R5B6P0eS5wX5V5Y8gR5V5Y8gR5V5Y8gR5V5Y8gR5V5Y8gR5V5Y8gR5V5",
        title: "Raw Local Honey",
        subtitle: "Pantry � 98 units",
        revenue: "$882",
        trendValue: "8%",
        trendIcon: "trending_up",
        trendClass: "text-primary bg-primary-container/50"
      },
      {
        id: "3",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB23J8N2wZ8rVXZVXYqQY-h1R5B6P0eS5wX5V5Y8gR5V5Y8gR5V5Y8gR5V5Y8gR5V5Y8gR5V5Y8gR5V5",
        title: "Ceramic Candles",
        subtitle: "Home � 64 units",
        revenue: "$768",
        trendValue: "2%",
        trendIcon: "trending_down",
        trendClass: "text-error bg-error-container/50"
      }
    ],
    customers: {
      total: "1,248",
      newPercentage: "32% New"
    }
  };
};



export interface StoreProfileData {
  heroImage: string;
  logo: string;
  name: string;
  rating: string;
  reviews: string;
  location: string;
  category: string;
  ownerName: string;
  phone: string;
  email: string;
  about: string;
  operations: {
    hours: string;
    hoursSub: string;
    deliveryRadius: string;
    deliverySub: string;
    minimumOrder: string;
    minimumSub: string;
  };
  preview: {
    image: string;
    distance: string;
    tags: string[];
  };
}

export const getStoreProfileData = async (): Promise<StoreProfileData> => {
  const resProfile = await fetch(`${API_BASE_URL}/api/merchant/profile`, { headers: { 'x-user-id': 'merchant-123' } });
    const jsonProfile = await resProfile.json();
    const storeId = await getStoreId();
    let storeData = null;
    if (storeId) {
      const resStore = await fetch(`${API_BASE_URL}/api/merchant/stores/${storeId}`, { headers: { 'x-user-id': 'merchant-123' } });
      const jsonStore = await resStore.json();
      if (jsonStore.success) storeData = jsonStore.data;
    }
    
    return {
      heroImage: "",
      logo: "",
      name: storeData?.name || jsonProfile?.data?.name || "Store",
      rating: "5.0",
      reviews: "(0 reviews)",
      location: storeData?.city || "",
      category: storeData?.businessType || "Retail",
      ownerName: jsonProfile?.data?.name || "Owner",
      phone: jsonProfile?.data?.phone || "",
      email: jsonProfile?.data?.email || "",
      about: storeData?.description || "",
      operations: {
        hours: "9 AM - 9 PM",
        hoursSub: "Open Everyday",
        deliveryRadius: "5 Kilometers",
        deliverySub: "Hyperlocal Delivery",
        minimumOrder: "₹200",
        minimumSub: "For Free Delivery"
      },
      preview: {
        image: "",
        distance: "0 km",
        tags: []
      }
    };
  
};



export interface OrderTimelineItem {
  time: string;
  title: string;
  type: "completed" | "current" | "pending";
}

export interface OrderItem {
  id: string;
  image: string;
  name: string;
  details: string;
  total: string;
}

export interface OrderDetailsData {
  orderId: string;
  status: string;
  time: string;
  customer: {
    image: string;
    name: string;
    phone: string;
    address: string;
  };
  timeline: OrderTimelineItem[];
  items: OrderItem[];
  summary: {
    subtotal: string;
    delivery: string;
    discount: string;
    total: string;
  };
  notes: string;
}

export const getOrderDetailsData = async (): Promise<OrderDetailsData> => {
  await delay(500);
  return {
    orderId: "BZ10231",
    status: "Preparing",
    time: "Today, 10:30 AM",
    customer: {
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAUvYlaTZ-gqvO4qgL_QmZbJmpF6mt7bbIOAABCVM_vXBxesyLpKj2Cw2Sh_SpHr6xjlCeZzJ9tJX5v4ogSLYAjxnwq7DxEznWbvzu4WOD-UIFecpi43UXsg7huz2-k8NLOosYwmSnfQ59mp9P3xRMhwGu72QAf1Zs_mDJoSLkOXH43oxTcC997eRBopsU6eaSszBNbETuBBFtuRU9jvSVdBzjvKhO26wmQeMHc5VbeRRnSIIH7mwNS",
      name: "Amrita Singh",
      phone: "+91 98765 43210",
      address: "42nd Street, Malleswaram<br />Bangalore, Karnataka 560003"
    },
    timeline: [
      { time: "10:30 AM", title: "Order Received", type: "completed" },
      { time: "10:35 AM", title: "Order Accepted", type: "completed" },
      { time: "Current", title: "Preparing Order", type: "current" },
      { time: "Pending", title: "Ready for Delivery", type: "pending" }
    ],
    items: [
      {
        id: "1",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD24CTcWFQPQon4MYirH484kubuX4kr1ktfii_pxtuSFpPgm-txns2DhVOfPXoEUx3GofLXsxfhW-GCkCwBZdmaGfwsfdpwwSHVRg9aPqWwaIyy2IEp0gg55lJGVQX_2zcXNqqCUTS5qbAWa4RhHh-z3tEUHH7ete2Ze5cig1qYyoETOruq3EKGhyX63e7JUNX9XP_iI0zGHLF_3m_Nr-HElU1_4XLB5m7_TBVxrCaOQ4wB73x_Xgp4",
        name: "Organic Sourdough",
        details: "2 units x ?60",
        total: "?120"
      },
      {
        id: "2",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3ccIphSyqSUQdZ-ZhAHcMdF-9pka1g6Muy4Up4WrjBWOXXJ5zsQ5r5K6pgdd2FEe_H-sJGfQs32QRFDH5-bWQfsyIl21zMhWnPUofCemVBoj1nAxSwysNpkBQ2pepDZ86BF5k7D6VonELTA_WfpgyPREZBFCx6l90gTYHrtNwPCQvQSt1ogkdfv66_liA7Sycy2XkzOZwG4aibJXVBdigOywSU2gHnmnDWYSwveqN-gXeJizH0c2W",
        name: "Farm Fresh Milk",
        details: "1L x ?65",
        total: "?65"
      },
      {
        id: "3",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCl39YVg-EM0k9p9V32rpFzZwPJiLKaN7FLmMYjyneuevNxE_qeWvNvyeCbKl4bzIJ42JAZ97MWdBjcs6gsSevIHkuvcjUpHAVKu6sFs5hHIPwBbq0c4zm5DLeFuAtHVGUpQr9Mf_HPTd-H3g3O2eEF4QQd09IvJGnPnaQ_OOI8hAUfiRH3wTBSUpu85329N-s941wrmmFGCK34UuEtQqvK2Oy2KFyIIAnQEPqmqDH9xnOSmw_FEdZs",
        name: "Raw Local Honey",
        details: "500g x ?480",
        total: "?480"
      }
    ],
    summary: {
      subtotal: "?665",
      delivery: "?40",
      discount: "-?0",
      total: "?705"
    },
    notes: "\"Customer requested contactless delivery if possible. Call before arriving.\""
  };
};



export interface ScheduleItem {
  id: string;
  statusText: string;
  amount: string;
  details: string;
  icon: string;
  type: "settled" | "processing" | "projected";
}

export interface TransactionItem {
  id: string;
  date: string;
  time: string;
  orderId: string;
  method: string;
  methodIcon: string;
  status: string;
  statusClass: string;
  statusDotClass: string;
  amount: string;
  amountClass?: string;
  isBgLowest?: boolean;
}

export interface PaymentsData {
  metrics: {
    todayRevenue: string;
    todayRevenueTrend: string;
    pendingSettlements: string;
    pendingSettlementsSub: string;
    lastSettlement: string;
    lastSettlementDate: string;
  };
  schedule: ScheduleItem[];
  transactions: TransactionItem[];
}

export const getPaymentsData = async (): Promise<PaymentsData> => {
  await delay(500);
  return {
    metrics: {
      todayRevenue: "?4,250",
      todayRevenueTrend: "+12% vs yesterday",
      pendingSettlements: "?12,840",
      pendingSettlementsSub: "Expected tomorrow",
      lastSettlement: "?18,200",
      lastSettlementDate: "24 Oct 2023"
    },
    schedule: [
      {
        id: "1",
        type: "settled",
        statusText: "Oct 24 � Settled",
        amount: "?18,200",
        details: "HDFC Bank ****4598",
        icon: "account_balance"
      },
      {
        id: "2",
        type: "processing",
        statusText: "Tomorrow � Processing",
        amount: "?12,840",
        details: "Includes today's batch until 6 PM",
        icon: ""
      },
      {
        id: "3",
        type: "projected",
        statusText: "Oct 26 � Projected",
        amount: "~ ?8,500",
        details: "Based on current run rate",
        icon: ""
      }
    ],
    transactions: [
      {
        id: "1",
        date: "25 Oct",
        time: "14:32",
        orderId: "#BZ-8829",
        method: "UPI",
        methodIcon: "qr_code_scanner",
        status: "Success",
        statusClass: "bg-primary-fixed/30 text-on-primary-fixed-variant",
        statusDotClass: "bg-primary",
        amount: "?1,250"
      },
      {
        id: "2",
        date: "25 Oct",
        time: "13:15",
        orderId: "#BZ-8828",
        method: "Cash",
        methodIcon: "payments",
        status: "Success",
        statusClass: "bg-primary-fixed/30 text-on-primary-fixed-variant",
        statusDotClass: "bg-primary",
        amount: "?450",
        isBgLowest: true
      },
      {
        id: "3",
        date: "25 Oct",
        time: "11:45",
        orderId: "#BZ-8827",
        method: "Card",
        methodIcon: "credit_card",
        status: "Processing",
        statusClass: "bg-secondary-fixed/50 text-secondary",
        statusDotClass: "bg-secondary animate-pulse",
        amount: "?2,550",
        amountClass: "text-secondary"
      },
      {
        id: "4",
        date: "24 Oct",
        time: "18:20",
        orderId: "#BZ-8826",
        method: "UPI",
        methodIcon: "qr_code_scanner",
        status: "Success",
        statusClass: "bg-primary-fixed/30 text-on-primary-fixed-variant",
        statusDotClass: "bg-primary",
        amount: "?890",
        isBgLowest: true
      }
    ]
  };
};



export interface CriticalStockItem {
  id: string;
  image: string;
  name: string;
  sku: string;
  unitsLeft: string;
  expected: string;
}

export interface AiRecommendationItem {
  id: string;
  name: string;
  reason: string;
  qty: string;
  icon: string;
  iconColorClass: string;
}

export interface ActivePoItem {
  id: string;
  poId: string;
  status: string;
  statusClass: string;
  supplier: string;
  summary: string;
  dateOrAction: string;
  actionIcon: string;
}

export interface KeySupplierItem {
  id: string;
  initial: string;
  initialClass: string;
  name: string;
  balance: string;
  balanceClass: string;
}

export interface RestockCenterData {
  criticalStock: {
    countText: string;
    items: CriticalStockItem[];
  };
  aiRecommendations: {
    items: AiRecommendationItem[];
  };
  activePos: {
    items: ActivePoItem[];
  };
  keySuppliers: {
    items: KeySupplierItem[];
  };
}

export const getRestockCenterData = async (): Promise<RestockCenterData> => {
  await delay(500);
  return {
    criticalStock: {
      countText: "3 Items Need Action",
      items: [
        {
          id: "1",
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAUvYlaTZ-gqvO4qgL_QmZbJmpF6mt7bbIOAABCVM_vXBxesyLpKj2Cw2Sh_SpHr6xjlCeZzJ9tJX5v4ogSLYAjxnwq7DxEznWbvzu4WOD-UIFecpi43UXsg7huz2-k8NLOosYwmSnfQ59mp9P3xRMhwGu72QAf1Zs_mDJoSLkOXH43oxTcC997eRBopsU6eaSszBNbETuBBFtuRU9jvSVdBzjvKhO26wmQeMHc5VbeRRnSIIH7mwNS",
          name: "Organic Whole Milk",
          sku: "SKU: MLK-1002",
          unitsLeft: "2 units left",
          expected: "Expected: Tomorrow"
        },
        {
          id: "2",
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD24CTcWFQPQon4MYirH484kubuX4kr1ktfii_pxtuSFpPgm-txns2DhVOfPXoEUx3GofLXsxfhW-GCkCwBZdmaGfwsfdpwwSHVRg9aPqWwaIyy2IEp0gg55lJGVQX_2zcXNqqCUTS5qbAWa4RhHh-z3tEUHH7ete2Ze5cig1qYyoETOruq3EKGhyX63e7JUNX9XP_iI0zGHLF_3m_Nr-HElU1_4XLB5m7_TBVxrCaOQ4wB73x_Xgp4",
          name: "Artisan Sourdough",
          sku: "SKU: BRD-441",
          unitsLeft: "5 units left",
          expected: "Expected: Today"
        },
        {
          id: "3",
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCl39YVg-EM0k9p9V32rpFzZwPJiLKaN7FLmMYjyneuevNxE_qeWvNvyeCbKl4bzIJ42JAZ97MWdBjcs6gsSevIHkuvcjUpHAVKu6sFs5hHIPwBbq0c4zm5DLeFuAtHVGUpQr9Mf_HPTd-H3g3O2eEF4QQd09IvJGnPnaQ_OOI8hAUfiRH3wTBSUpu85329N-s941wrmmFGCK34UuEtQqvK2Oy2KFyIIAnQEPqmqDH9xnOSmw_FEdZs",
          name: "Raw Wildflower Honey",
          sku: "SKU: HNY-092",
          unitsLeft: "8 units left",
          expected: "Expected: Oct 12"
        }
      ]
    },
    aiRecommendations: {
      items: [
        {
          id: "1",
          name: "Avocado Oil (1L)",
          reason: "Sales up 15% this week",
          qty: "48",
          icon: "trending_up",
          iconColorClass: "text-primary bg-primary-container/20"
        },
        {
          id: "2",
          name: "Holiday Spice Blend",
          reason: "Seasonal prep (Q4)",
          qty: "120",
          icon: "event_note",
          iconColorClass: "text-secondary bg-secondary-container/20"
        }
      ]
    },
    activePos: {
      items: [
        {
          id: "1",
          poId: "PO-2023-089",
          status: "Sent",
          statusClass: "text-primary bg-primary-container/20",
          supplier: "Farm Fresh Dairies",
          summary: "12 Items � $450.00",
          dateOrAction: "Oct 10",
          actionIcon: "schedule"
        },
        {
          id: "2",
          poId: "PO-2023-090",
          status: "Draft",
          statusClass: "text-tertiary bg-surface-container-highest",
          supplier: "Global Spices Co.",
          summary: "45 Items � $1,280.50",
          dateOrAction: "Edit",
          actionIcon: "edit"
        }
      ]
    },
    keySuppliers: {
      items: [
        {
          id: "1",
          initial: "F",
          initialClass: "bg-on-primary text-primary",
          name: "Farm Fresh",
          balance: "Bal: $0.00",
          balanceClass: "opacity-80"
        },
        {
          id: "2",
          initial: "O",
          initialClass: "bg-secondary text-on-secondary",
          name: "Organic Valley",
          balance: "Bal: $450.00",
          balanceClass: "opacity-80 text-secondary-fixed-dim"
        }
      ]
    }
  };
};



export interface PlMetric {
  title: string;
  value: string;
  trend: string;
  trendText: string;
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
  bgClass: string;
}

export interface ExpenseBreakdownItem {
  id: string;
  name: string;
  percentage: string;
  amount: string;
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
  dotClass: string;
}

export interface ProfitLossData {
  metrics: {
    revenue: PlMetric;
    expenses: PlMetric;
    profit: {
      value: string;
      margin: string;
    };
  };
  expensesBreakdown: {
    total: string;
    items: ExpenseBreakdownItem[];
  };
  monthlyGoal: {
    target: string;
    reachedPercentage: string;
    remaining: string;
  };
  aiInsight: string;
}

export const getProfitLossData = async (): Promise<ProfitLossData> => {
  await delay(500);
  return {
    metrics: {
      revenue: {
        title: "Total Revenue",
        value: "?2,84,500",
        trend: "+12.4%",
        trendText: "vs last month",
        icon: "arrow_upward",
        iconBgClass: "bg-surface-container",
        iconColorClass: "text-primary",
        bgClass: "bg-surface-container-lowest"
      },
      expenses: {
        title: "Total Expenses",
        value: "?2,32,400",
        trend: "+5.2%",
        trendText: "vs last month",
        icon: "arrow_downward",
        iconBgClass: "bg-surface-container",
        iconColorClass: "text-error",
        bgClass: "bg-surface-container-lowest"
      },
      profit: {
        value: "?52,100",
        margin: "18.3% Margin"
      }
    },
    expensesBreakdown: {
      total: "?2,32,400 (Total)",
      items: [
        {
          id: "1",
          name: "Product Cost (COGS)",
          percentage: "84.4%",
          amount: "?1,96,200",
          icon: "inventory_2",
          iconBgClass: "bg-primary/10",
          iconColorClass: "text-primary",
          dotClass: "bg-primary"
        },
        {
          id: "2",
          name: "Staff & Operations",
          percentage: "7.7%",
          amount: "?18,000",
          icon: "groups",
          iconBgClass: "bg-secondary/10",
          iconColorClass: "text-secondary",
          dotClass: "bg-secondary"
        },
        {
          id: "3",
          name: "Delivery & Logistics",
          percentage: "5.3%",
          amount: "?12,400",
          icon: "local_shipping",
          iconBgClass: "bg-tertiary/10",
          iconColorClass: "text-tertiary",
          dotClass: "bg-tertiary"
        },
        {
          id: "4",
          name: "Marketing",
          percentage: "2.5%",
          amount: "?5,800",
          icon: "campaign",
          iconBgClass: "bg-secondary-fixed/50",
          iconColorClass: "text-secondary",
          dotClass: "bg-secondary-fixed"
        }
      ]
    },
    monthlyGoal: {
      target: "?5L",
      reachedPercentage: "74% Reached",
      remaining: "?2.15L"
    },
    aiInsight: "Your logistics costs are <strong class=\"text-white\">12% higher</strong> than usual this week. Review recent delivery partner invoices in Procurement."
  };
};



export interface CampaignData {
  id: string;
  title: string;
  badge: string;
  badgeClass: string;
  badgeDotClass: string;
  description: string;
  stats: {
    reach: string;
    clicks: string;
    conversion: string;
    conversionClass?: string;
    conversionIcon?: boolean;
  };
  progress: number;
  progressClass: string;
  footerText?: string;
  footerClass?: string;
  bgClass: string;
}

export interface MarketingData {
  header: {
    titlePrefix: string;
    titleHighlight: string;
    subtitle: string;
  };
  hero: {
    title: string;
    subtitle: string;
    lift: string;
  };
  campaigns: CampaignData[];
}

export const getMarketingData = async (): Promise<MarketingData> => {
  await delay(500);
  return {
    header: {
      titlePrefix: "Bring customers",
      titleHighlight: "back",
      subtitle: "Create simple campaigns that keep your store top of mind."
    },
    hero: {
      title: "Start your next campaign",
      subtitle: "Reach your customers directly with tailored offers and updates.",
      lift: "+24%"
    },
    campaigns: [
      {
        id: "1",
        title: "20% Off Sweets Pre-order",
        badge: "Diwali Special",
        badgeClass: "bg-primary-container text-on-primary-container border-primary/10",
        badgeDotClass: "bg-primary animate-pulse-soft",
        description: "Sent via WhatsApp & SMS",
        stats: {
          reach: "1.2k",
          clicks: "342",
          conversion: "12%",
          conversionClass: "text-primary",
          conversionIcon: true
        },
        progress: 75,
        progressClass: "from-primary to-primary-fixed-dim",
        footerText: "3 days remaining",
        footerClass: "text-on-surface-variant text-right",
        bgClass: "bg-primary/5"
      },
      {
        id: "2",
        title: "We Miss You - 10% Coupon",
        badge: "Re-engagement",
        badgeClass: "bg-secondary-container text-on-secondary-container border-secondary/10",
        badgeDotClass: "bg-secondary animate-pulse-soft",
        description: "Automated Email Flow",
        stats: {
          reach: "450",
          clicks: "180",
          conversion: "8%",
          conversionClass: "text-secondary"
        },
        progress: 100,
        progressClass: "from-secondary to-secondary-fixed-dim",
        footerText: "Ongoing",
        footerClass: "text-secondary font-bold uppercase tracking-widest",
        bgClass: "bg-secondary/5"
      }
    ]
  };
};



export interface FilterItem {
  id: string;
  icon: string;
  text: string;
}

export interface MetricItem {
  id: string;
  label: string;
  value: string;
  trend: string;
  trendClass: string;
  trendIcon: string;
  trendValue: string;
}

export interface PopularItem {
  id: string;
  name: string;
  percentageText: string;
  percentageValue: string;
  barClass: string;
}

export interface GrowingCategoryItem {
  id: string;
  name: string;
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
  trend: string;
  trendClass: string;
}

export interface LocalMarketIntelligenceData {
  filters: FilterItem[];
  metrics: MetricItem[];
  opportunity: {
    title: string;
    descriptionHtml: string;
  };
  popularNearby: PopularItem[];
  growingCategories: GrowingCategoryItem[];
}

export const getLocalMarketIntelligenceData = async (): Promise<LocalMarketIntelligenceData> => {
  await delay(500);
  return {
    filters: [
      { id: "1", icon: "location_on", text: "Sri Lakshmi Stores" },
      { id: "2", icon: "radar", text: "Radius: 1 km" },
      { id: "3", icon: "calendar_today", text: "Last 30 Days" },
      { id: "4", icon: "category", text: "All Categories" }
    ],
    metrics: [
      {
        id: "1",
        label: "Potential Customers",
        value: "5,620",
        trend: "+12%",
        trendClass: "text-primary",
        trendIcon: "trending_up",
        trendValue: "+12%"
      },
      {
        id: "2",
        label: "Active Customers",
        value: "2,184",
        trend: "+5%",
        trendClass: "text-primary",
        trendIcon: "trending_up",
        trendValue: "+5%"
      },
      {
        id: "3",
        label: "Repeat Rate",
        value: "64%",
        trend: "Stable",
        trendClass: "text-outline",
        trendIcon: "horizontal_rule",
        trendValue: "Stable"
      },
      {
        id: "4",
        label: "Avg. Order Value",
        value: "?386",
        trend: "+?42",
        trendClass: "text-primary",
        trendIcon: "trending_up",
        trendValue: "+?42"
      }
    ],
    opportunity: {
      title: "Surge in Beverage Demand",
      descriptionHtml: "Local demand for cold beverages and juices has spiked by <strong class=\"text-on-secondary-container font-semibold\">+24%</strong> in the last week due to rising temperatures. Your stock levels are lower than the neighborhood average."
    },
    popularNearby: [
      { id: "1", name: "Nandini Milk (500ml)", percentageText: "28% of baskets", percentageValue: "28%", barClass: "bg-primary" },
      { id: "2", name: "Modern Bread (400g)", percentageText: "19% of baskets", percentageValue: "19%", barClass: "bg-primary/80" },
      { id: "3", name: "India Gate Basmati Rice", percentageText: "16% of baskets", percentageValue: "16%", barClass: "bg-primary/60" }
    ],
    growingCategories: [
      {
        id: "1",
        name: "Beverages",
        icon: "local_cafe",
        iconBgClass: "bg-primary-fixed",
        iconColorClass: "text-on-primary-fixed",
        trend: "+24%",
        trendClass: "bg-primary-container/20 text-primary-container"
      },
      {
        id: "2",
        name: "Snacks",
        icon: "cookie",
        iconBgClass: "bg-secondary-fixed",
        iconColorClass: "text-on-secondary-fixed",
        trend: "+18%",
        trendClass: "bg-primary-container/20 text-primary-container"
      },
      {
        id: "3",
        name: "Cleaning",
        icon: "cleaning_services",
        iconBgClass: "bg-tertiary-fixed",
        iconColorClass: "text-on-tertiary-fixed",
        trend: "+9%",
        trendClass: "bg-primary-container/20 text-primary-container"
      },
      {
        id: "4",
        name: "Dairy & Eggs",
        icon: "egg",
        iconBgClass: "bg-surface-variant",
        iconColorClass: "text-on-surface-variant",
        trend: "-2%",
        trendClass: "bg-outline/20 text-outline"
      }
    ]
  };
};



export interface CustomerMetric {
  id: string;
  label: string;
  value: string;
  trend: string;
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
  svgColorClass: string;
  isProgressBar?: boolean;
  progressValue?: string;
}

export interface RegularCustomer {
  id: string;
  name: string;
  orders: string;
  badge: string;
  badgeClass: string;
  image?: string;
  initial?: string;
  initialBgClass?: string;
}

export interface DirectoryCustomer {
  id: string;
  name: string;
  email: string;
  orders: string;
  spend: string;
  category: string;
  badge: string;
  badgeClass: string;
  initial: string;
  initialBgClass: string;
  initialColorClass: string;
}

export interface CustomersData {
  metrics: CustomerMetric[];
  regulars: RegularCustomer[];
  directory: DirectoryCustomer[];
}

export const getCustomersData = async (): Promise<CustomersData> => {
  await delay(500);
  return {
    metrics: [
      {
        id: "1",
        label: "Total Customers",
        value: "1,240",
        trend: "+12%",
        icon: "groups",
        iconBgClass: "bg-primary-container",
        iconColorClass: "text-on-primary-container",
        svgColorClass: "text-primary"
      },
      {
        id: "2",
        label: "New Customers",
        value: "84",
        trend: "+5%",
        icon: "person_add",
        iconBgClass: "bg-secondary-container",
        iconColorClass: "text-on-secondary-container",
        svgColorClass: "text-secondary"
      },
      {
        id: "3",
        label: "Returning",
        value: "956",
        trend: "+18%",
        icon: "loop",
        iconBgClass: "bg-tertiary-container",
        iconColorClass: "text-on-tertiary-container",
        svgColorClass: "text-tertiary"
      },
      {
        id: "4",
        label: "Repeat Rate",
        value: "78%",
        trend: "Excellent",
        icon: "favorite",
        iconBgClass: "bg-on-primary/20",
        iconColorClass: "text-on-primary",
        svgColorClass: "text-primary-fixed",
        isProgressBar: true,
        progressValue: "78%"
      }
    ],
    regulars: [
      {
        id: "1",
        name: "Sarah Jenkins",
        orders: "42 Orders",
        badge: "VIP Member",
        badgeClass: "bg-secondary-container text-on-secondary-container",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDu3rca1XukDvox5iedIwguU1miOZPaU3uQ2VwLuR282ohWAVIo-n9epVOUC8vlvcTJy0XAnRAjjMEB1mGMSTk_LljoNt9xOsdZU7eaRt7xfw7K4UlGTYMNDxEttous4FDweXmgzRh4ad60iC5C_JejPMfFOyEESa3rFSPR1luLnah6IUyI4h-4ihGB40fAacjQwdrzzPmFMy_K5nPQcC041NdzuWtTOaoNIwDMKmZ_E65JEZTMcfy4"
      },
      {
        id: "2",
        name: "David Chen",
        orders: "38 Orders",
        badge: "Regular",
        badgeClass: "bg-primary-container text-on-primary-container",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_YGAIlbiWeNY3vFQkJyrGFyq2xke4fvhTDAwrM8xlkFXNYMJaIOwIqN1JKm1ym2i5wzhZNgnkCu68oEl1fZk6HHBbmoXycMpkRqnTj06675r2zVdxGZCKZc-6Iq0SKQQ8TkfZ7Wne0DtHyD0tHdDwgloO737qicgDLJec5JxkJcbty2TTnSxONqj54b-UQ7SDWdb5mTgpQ44uLxkFCJvHhAnkysmZ4c73GTiyGTawwcD6b28ZUDQ3"
      },
      {
        id: "3",
        name: "Maria Rossi",
        orders: "31 Orders",
        badge: "VIP Member",
        badgeClass: "bg-secondary-container text-on-secondary-container",
        initial: "M",
        initialBgClass: "bg-surface-container-highest text-on-surface-variant"
      },
      {
        id: "4",
        name: "Elena Rostova",
        orders: "29 Orders",
        badge: "Regular",
        badgeClass: "bg-primary-container text-on-primary-container",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBvSBBVuyuY_MJJszDeKI49YTj-XwFM4AAzTQzFRR0ZeOFP2YdNj1WeMPsC3cHS6cNKdbW--go7CsjrspsbPogcM9FfTIOqd3OQL1zPgewM59JzzESdEGW7N28rH0uKNyfzP1G9vcGy1hWWO-vYuwx0Jgh3YQreuwJBAgNAHXizqrNDgKrhGbur1CE_rQhm7u1H76r5UmPKC1MLBfs0Ypn-DdgWyLfHE6mRMy2amQLZymdaVW9_4xhx"
      }
    ],
    directory: [
      {
        id: "1",
        name: "Sarah Jenkins",
        email: "sarah.j@example.com",
        orders: "42",
        spend: "$3,240.50",
        category: "Bakery",
        badge: "VIP",
        badgeClass: "bg-secondary-container text-on-secondary-container",
        initial: "S",
        initialBgClass: "bg-primary-fixed",
        initialColorClass: "text-on-primary-fixed"
      },
      {
        id: "2",
        name: "David Chen",
        email: "david.c@example.com",
        orders: "38",
        spend: "$2,890.00",
        category: "Produce",
        badge: "Regular",
        badgeClass: "bg-primary-container text-on-primary-container",
        initial: "D",
        initialBgClass: "bg-surface-container-highest",
        initialColorClass: "text-on-surface"
      },
      {
        id: "3",
        name: "Maria Rossi",
        email: "m.rossi@example.com",
        orders: "31",
        spend: "$1,950.25",
        category: "Dairy & Eggs",
        badge: "VIP",
        badgeClass: "bg-secondary-container text-on-secondary-container",
        initial: "M",
        initialBgClass: "bg-secondary-fixed",
        initialColorClass: "text-on-secondary-fixed"
      },
      {
        id: "4",
        name: "James Wilson",
        email: "jwilson88@example.com",
        orders: "2",
        spend: "$145.00",
        category: "Beverages",
        badge: "New",
        badgeClass: "bg-tertiary-container text-on-tertiary-container",
        initial: "J",
        initialBgClass: "bg-surface-variant",
        initialColorClass: "text-on-surface"
      }
    ]
  };
};



export interface ActivityMetric {
  id: string;
  label: string;
  value: string;
  trend: string;
  trendDirection: string;
  trendClass: string;
  trendText?: string;
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
  bgClass: string;
  blurClass: string;
  labelClass: string;
}

export interface ActivityFilter {
  id: string;
  label: string;
  icon?: string;
  isPrimary?: boolean;
}

export interface ActivityLog {
  id: string;
  time: string;
  actor: string;
  actorType: string;
  actorIcon: string;
  actorBgClass: string;
  action: string;
  status: string;
  statusClass: string;
  message: string;
  detailsIcon?: string;
  detailsText?: string;
  cardBgClass: string;
}

export interface ActivityDetail {
  actor: string;
  actorType: string;
  actorIcon: string;
  timestamp: string;
  action: string;
  status: string;
  resourceName: string;
  resourceSku: string;
  oldValue: string;
  newValue: string;
  reason: string;
}

export interface AuditTrailData {
  metrics: ActivityMetric[];
  filters: ActivityFilter[];
  timeline: ActivityLog[];
  activityDetail: ActivityDetail;
}

export const getAuditTrailData = async (): Promise<AuditTrailData> => {
  await delay(500);
  return {
    metrics: [
      {
        id: "1",
        label: "Total Activity",
        value: "1,248",
        trend: "12%",
        trendDirection: "arrow_upward",
        trendClass: "bg-inverse-on-surface text-on-surface",
        trendText: "vs last week",
        icon: "history",
        iconBgClass: "bg-surface",
        iconColorClass: "text-primary",
        bgClass: "bg-surface-container",
        blurClass: "bg-primary/5 group-hover:bg-primary/10",
        labelClass: "text-on-surface-variant"
      },
      {
        id: "2",
        label: "Human",
        value: "482",
        trend: "3%",
        trendDirection: "arrow_downward",
        trendClass: "bg-inverse-on-surface text-on-surface",
        icon: "person",
        iconBgClass: "bg-surface",
        iconColorClass: "text-secondary",
        bgClass: "bg-surface-container",
        blurClass: "bg-secondary/5 group-hover:bg-secondary/10",
        labelClass: "text-on-surface-variant"
      },
      {
        id: "3",
        label: "AI Agent",
        value: "615",
        trend: "28%",
        trendDirection: "arrow_upward",
        trendClass: "bg-on-primary-container text-primary-container",
        icon: "smart_toy",
        iconBgClass: "bg-primary",
        iconColorClass: "text-on-primary",
        bgClass: "bg-primary-container",
        blurClass: "bg-primary/20 group-hover:bg-primary/30",
        labelClass: "text-on-primary-container/80"
      },
      {
        id: "4",
        label: "System",
        value: "143",
        trend: "0%",
        trendDirection: "horizontal_rule",
        trendClass: "bg-surface-variant text-on-surface-variant",
        icon: "settings",
        iconBgClass: "bg-surface",
        iconColorClass: "text-tertiary",
        bgClass: "bg-surface-container",
        blurClass: "bg-tertiary/5 group-hover:bg-tertiary/10",
        labelClass: "text-on-surface-variant"
      },
      {
        id: "5",
        label: "Failed",
        value: "8",
        trend: "2%",
        trendDirection: "arrow_downward",
        trendClass: "bg-error/10 text-error",
        icon: "error",
        iconBgClass: "bg-surface",
        iconColorClass: "text-error",
        bgClass: "bg-error-container/30",
        blurClass: "bg-error/5 group-hover:bg-error/10",
        labelClass: "text-on-error-container/80"
      }
    ],
    filters: [
      { id: "1", label: "All", isPrimary: true },
      { id: "2", label: "Human", icon: "person" },
      { id: "3", label: "AI Agent", icon: "smart_toy" },
      { id: "4", label: "System", icon: "settings" },
      { id: "5", label: "Orders" },
      { id: "6", label: "Products" },
      { id: "7", label: "Inventory" }
    ],
    timeline: [
      {
        id: "1",
        time: "10:42 AM",
        actor: "Revenue Agent",
        actorType: "text-primary",
        actorIcon: "smart_toy",
        actorBgClass: "bg-primary-container text-on-primary-container",
        action: "suggested promotion",
        status: "Successful",
        statusClass: "bg-inverse-on-surface text-primary",
        message: "\"Breakfast Combo\" Promotion Created",
        detailsIcon: "sell",
        detailsText: "Applied to: Milk (1L), Bread (400g), Eggs (6pcs)",
        cardBgClass: "bg-surface-container group-hover:bg-surface-container-high"
      },
      {
        id: "2",
        time: "10:38 AM",
        actor: "Ravi (Admin)",
        actorType: "text-secondary",
        actorIcon: "person",
        actorBgClass: "bg-secondary-container text-on-secondary-container",
        action: "updated price",
        status: "Successful",
        statusClass: "bg-inverse-on-surface text-primary",
        message: "Amul Taaza Milk 1L <span class=\"text-outline line-through text-sm\">?58</span> <span class=\"material-symbols-outlined text-[16px] text-outline\">arrow_forward</span> <span class=\"text-primary\">?60</span>",
        cardBgClass: "bg-surface-container group-hover:bg-surface-container-high"
      },
      {
        id: "3",
        time: "10:21 AM",
        actor: "Bazaar System",
        actorType: "text-tertiary",
        actorIcon: "settings",
        actorBgClass: "bg-surface-variant text-on-surface-variant",
        action: "automated sync",
        status: "Successful",
        statusClass: "bg-inverse-on-surface text-primary",
        message: "Inventory Synchronized",
        detailsIcon: "cloud_done",
        detailsText: "Synced 142 items with remote database",
        cardBgClass: "bg-surface-container group-hover:bg-surface-container-high"
      },
      {
        id: "4",
        time: "09:15 AM",
        actor: "Restock Agent",
        actorType: "text-primary",
        actorIcon: "smart_toy",
        actorBgClass: "bg-primary-container text-on-primary-container",
        action: "attempted order placement",
        status: "Failed",
        statusClass: "bg-error/10 text-error",
        message: "Purchase Order #PO-8832",
        detailsIcon: "warning",
        detailsText: "Supplier API timeout. Retrying in 1 hour.",
        cardBgClass: "bg-error-container/20 group-hover:bg-error-container/30"
      }
    ],
    activityDetail: {
      actor: "Ravi",
      actorType: "Store Admin",
      actorIcon: "person",
      timestamp: "Oct 24, 2023 at 10:38 AM",
      action: "Updated Price",
      status: "Successful",
      resourceName: "Amul Taaza Milk 1L",
      resourceSku: "SKU: AML-TZ-1L-893",
      oldValue: "?58",
      newValue: "?60",
      reason: "\"Supplier increased wholesale price by ?1.50 per unit. Adjusting retail price to maintain margins.\""
    }
  };
};



export interface GrowthOpportunity {
  id: string;
  type: string;
  typeClass: string;
  typeBgClass: string;
  typeLabelClass: string;
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
  title: string;
  description: string;
  bgClass: string;
  blurClass: string;
  
  // Specific fields for different types of opportunities
  upliftAmount?: string;
  upliftPercentage?: string;
  
  inventoryItem?: {
    name: string;
    warning: string;
  };
  
  promotionTarget?: string;
  promotionTags?: string[];
  
  actionText: string;
  actionIcon: string;
  actionButtonClass: string;
}

export interface AIGrowthCenterData {
  header: {
    title: string;
    description: string;
  };
  opportunities: GrowthOpportunity[];
}

export const getAIGrowthCenterData = async (): Promise<AIGrowthCenterData> => {
  await delay(500);
  return {
    header: {
      title: "Your growth center",
      description: "Smart, data-driven recommendations tailored specifically to Sri Lakshmi Stores to help you maximize revenue and optimize operations."
    },
    opportunities: [
      {
        id: "1",
        type: "Revenue",
        typeClass: "text-secondary",
        typeBgClass: "bg-secondary-fixed",
        typeLabelClass: "text-secondary bg-secondary-fixed",
        icon: "payments",
        iconBgClass: "bg-secondary-container",
        iconColorClass: "text-on-secondary-container",
        title: "Bundle breakfast staples",
        description: "Customers buying bread frequently buy eggs. Creating a combo could increase average order value.",
        bgClass: "bg-surface-container-lowest",
        blurClass: "bg-secondary-fixed/20 group-hover:bg-secondary-fixed/30",
        upliftAmount: "+?4,500",
        upliftPercentage: "75%",
        actionText: "Apply Recommendation",
        actionIcon: "check_circle",
        actionButtonClass: "bg-secondary text-on-secondary hover:bg-on-secondary-container"
      },
      {
        id: "2",
        type: "Inventory",
        typeClass: "text-error",
        typeBgClass: "bg-error-container/50",
        typeLabelClass: "text-error bg-error-container/50",
        icon: "inventory",
        iconBgClass: "bg-error-container",
        iconColorClass: "text-on-error-container",
        title: "Restock Cooking Oil",
        description: "Sunflower Oil 1L is selling 2x faster than usual. You will run out in approximately 3 days.",
        bgClass: "bg-surface-container-lowest",
        blurClass: "bg-error-container/20 group-hover:bg-error-container/30",
        inventoryItem: {
          name: "Fortune Sunflower Oil 1L",
          warning: "12 left"
        },
        actionText: "Order from Supplier",
        actionIcon: "local_shipping",
        actionButtonClass: "bg-surface-container-high text-on-surface hover:bg-surface-variant border border-outline-variant/30"
      },
      {
        id: "3",
        type: "Promotion",
        typeClass: "text-primary",
        typeBgClass: "bg-primary-fixed",
        typeLabelClass: "text-primary bg-primary-fixed",
        icon: "campaign",
        iconBgClass: "bg-primary-container",
        iconColorClass: "text-on-primary-container",
        title: "Weekend flash sale",
        description: "Surplus fresh produce detected. A 15% weekend discount can move stock before spoilage.",
        bgClass: "bg-surface-container-lowest",
        blurClass: "bg-primary-fixed/20 group-hover:bg-primary-fixed/30",
        promotionTarget: "All Local Customers",
        promotionTags: ["Tomatoes", "Onions", "+3 more"],
        actionText: "Draft Campaign",
        actionIcon: "edit",
        actionButtonClass: "bg-primary text-on-primary hover:bg-on-primary-fixed-variant"
      }
    ]
  };
};



export interface AgentPermission {
  id: string;
  name: string;
  description: string;
  warning?: string;
  isHighImpact?: boolean;
  requiresBudget?: boolean;
  defaultChecked?: boolean;
}

export interface AgentRole {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
  bgClass: string;
  blurClass: string;
  permissions: AgentPermission[];
}

export interface AgentPermissionsData {
  header: {
    title: string;
    description: string;
  };
  roles: AgentRole[];
}

export const getAgentPermissionsData = async (): Promise<AgentPermissionsData> => {
  await delay(500);
  return {
    header: {
      title: "Agent Permissions",
      description: "Configure what your Bazaar agents are allowed to do autonomously. We recommend reviewing these settings periodically to ensure your digital workforce aligns with your business goals."
    },
    roles: [
      {
        id: "1",
        name: "Revenue Agent",
        description: "Focuses on maximizing profitability and sales volume.",
        icon: "monitoring",
        iconBgClass: "bg-primary-container",
        iconColorClass: "text-on-primary-container",
        bgClass: "bg-surface-container-lowest",
        blurClass: "bg-primary/5 group-hover:scale-110",
        permissions: [
          {
            id: "p1",
            name: "Read sales data",
            description: "Allows analysis of historical performance.",
            defaultChecked: true
          },
          {
            id: "p2",
            name: "Analyze customers",
            description: "Identify purchasing patterns and segments.",
            defaultChecked: true
          },
          {
            id: "p3",
            name: "Create recommendations",
            description: "Suggest actionable insights to merchant.",
            defaultChecked: true
          },
          {
            id: "p4",
            name: "Create promotions",
            description: "High Impact Action",
            isHighImpact: true,
            warning: "High Impact Action"
          },
          {
            id: "p5",
            name: "Modify prices",
            description: "High Impact Action",
            isHighImpact: true,
            warning: "High Impact Action"
          }
        ]
      },
      {
        id: "2",
        name: "Inventory Agent",
        description: "Manages stock levels and reordering.",
        icon: "inventory_2",
        iconBgClass: "bg-secondary-container",
        iconColorClass: "text-on-secondary-container",
        bgClass: "bg-surface-container-lowest",
        blurClass: "bg-secondary-container/20 group-hover:scale-110",
        permissions: [
          {
            id: "p6",
            name: "Monitor stock levels",
            description: "Track items falling below minimum thresholds.",
            defaultChecked: true
          },
          {
            id: "p7",
            name: "Draft purchase orders",
            description: "Prepare POs for merchant review.",
            defaultChecked: true
          },
          {
            id: "p8",
            name: "Auto-send POs to suppliers",
            description: "Requires budget limit setup",
            requiresBudget: true,
            warning: "Requires budget limit setup"
          },
          {
            id: "p9",
            name: "Delist dead stock",
            description: "Automatically remove products with zero sales in 90 days."
          }
        ]
      }
    ]
  };
};



export interface PerformanceMetric {
  id: string;
  label: string;
  value: string;
  trend?: string;
  trendIcon?: string;
  trendClass?: string;
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
  blurClass: string;
}

export interface AgentPerformanceDetail {
  id: string;
  name: string;
  status: string;
  statusClass: string;
  successRate: string;
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
  bgClass: string;
  blurClass: string;
  stats: {
    tasksCompleted: string;
    revenueInfluenced?: string;
    stockIssuesDetected?: string;
    recommendationsAccepted: string;
    recommendationsAcceptedValue: number;
    svgDasharrayClass: string;
  };
}

export interface AgentPerformanceData {
  metrics: PerformanceMetric[];
  agents: AgentPerformanceDetail[];
}

export const getAgentPerformanceData = async (): Promise<AgentPerformanceData> => {
  await delay(500);
  return {
    metrics: [
      {
        id: "1",
        label: "Active Agents",
        value: "5",
        icon: "smart_toy",
        iconBgClass: "bg-primary/10",
        iconColorClass: "text-primary",
        blurClass: "bg-primary/10 group-hover:scale-110"
      },
      {
        id: "2",
        label: "Tasks Completed",
        value: "1,284",
        icon: "task_alt",
        iconBgClass: "bg-secondary/10",
        iconColorClass: "text-secondary",
        blurClass: "bg-secondary/10 group-hover:scale-110"
      },
      {
        id: "3",
        label: "Success Rate",
        value: "97.8%",
        trend: "1.2%",
        trendIcon: "arrow_upward",
        trendClass: "text-primary",
        icon: "check_circle",
        iconBgClass: "bg-primary/10",
        iconColorClass: "text-primary",
        blurClass: "bg-primary/10 group-hover:scale-110"
      },
      {
        id: "4",
        label: "Revenue Influenced",
        value: "?42.8k",
        icon: "currency_rupee",
        iconBgClass: "bg-secondary/10",
        iconColorClass: "text-secondary",
        blurClass: "bg-secondary/10 group-hover:scale-110"
      },
      {
        id: "5",
        label: "Avg Response Time",
        value: "1.8s",
        icon: "speed",
        iconBgClass: "bg-primary/10",
        iconColorClass: "text-primary",
        blurClass: "bg-primary/10 group-hover:scale-110"
      }
    ],
    agents: [
      {
        id: "1",
        name: "Revenue Agent",
        status: "Active",
        statusClass: "text-primary",
        successRate: "98% Success",
        icon: "trending_up",
        iconBgClass: "bg-primary shadow-primary/20",
        iconColorClass: "text-on-primary",
        bgClass: "bg-surface-container-lowest",
        blurClass: "from-primary/10 to-transparent",
        stats: {
          tasksCompleted: "412",
          revenueInfluenced: "?24,500",
          recommendationsAccepted: "82%",
          recommendationsAcceptedValue: 82,
          svgDasharrayClass: "text-primary"
        }
      },
      {
        id: "2",
        name: "Inventory Agent",
        status: "Active",
        statusClass: "text-primary",
        successRate: "99% Success",
        icon: "inventory_2",
        iconBgClass: "bg-secondary shadow-secondary/20",
        iconColorClass: "text-on-secondary",
        bgClass: "bg-surface-container-lowest",
        blurClass: "from-secondary/10 to-transparent",
        stats: {
          tasksCompleted: "528",
          stockIssuesDetected: "14",
          recommendationsAccepted: "91%",
          recommendationsAcceptedValue: 91,
          svgDasharrayClass: "text-secondary"
        }
      }
    ]
  };
};


export interface Recommendation {
  id: string;
  type: string;
  typeIcon: string;
  typeClass: string;
  bgClass: string;
  blurClass: string;
  title: string;
  description: string;
  impactLabel: string;
  impactValue: string;
  impactValueClass: string;
  actionText: string;
  actionClass: string;
}

export interface ApprovalQueueItem {
  id: string;
  agentName: string;
  agentIcon: string;
  agentClass: string;
  status: string;
  title: string;
  description: string;
  impactLabel: string;
  impactIcon: string;
  impactClass: string;
  timeGenerated: string;
  borderClass: string;
}

export interface EfficacyStat {
  actionsExecuted: string;
  trend: string;
  trendDirection: string;
  chartData: number[]; // e.g. [12, 18, 9, 24, 31, 48]
  labels: string[]; // e.g. ["W1", "W2", "W3", "W4", "W5", "Now"]
}

export interface GovernanceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
  mode: "Manual" | "Auto";
}

export interface RecommendationsApprovalsData {
  recommendations: Recommendation[];
  approvalQueue: ApprovalQueueItem[];
  efficacy: EfficacyStat;
  governance: GovernanceCategory[];
}

export const getRecommendationsApprovalsData = async (): Promise<RecommendationsApprovalsData> => {
  await delay(500);
  return {
    recommendations: [
      {
        id: "1",
        type: "Revenue",
        typeIcon: "payments",
        typeClass: "text-primary",
        bgClass: "bg-surface-container-lowest",
        blurClass: "bg-primary/5",
        title: "Dynamic Pricing Alert",
        description: "Increase price of 5kg Basmati Rice by 4% due to local supply shortage. Expected to maintain volume.",
        impactLabel: "Est. Impact",
        impactValue: "+?1,450/wk",
        impactValueClass: "text-primary",
        actionText: "Apply Recommendation",
        actionClass: "bg-primary text-on-primary hover:bg-on-primary-fixed-variant shadow-primary/20"
      },
      {
        id: "2",
        type: "Inventory",
        typeIcon: "inventory_2",
        typeClass: "text-secondary",
        bgClass: "bg-surface-container-lowest",
        blurClass: "bg-secondary/5",
        title: "Reorder Suggestion",
        description: "Stock for 'Sunfeast Marie Light' is depleting 20% faster than usual. Reorder 50 units to prevent stockout.",
        impactLabel: "Risk Level",
        impactValue: "High (2 Days Left)",
        impactValueClass: "text-error",
        actionText: "Review Order",
        actionClass: "bg-surface-container-high text-on-surface hover:bg-surface-variant"
      },
      {
        id: "3",
        type: "Marketing",
        typeIcon: "campaign",
        typeClass: "text-tertiary",
        bgClass: "bg-surface-container-lowest",
        blurClass: "bg-tertiary/5",
        title: "Weekend Campaign",
        description: "Send SMS campaign for 'Monsoon Snack Fest' to top 20% loyal customers based on past purchasing behavior.",
        impactLabel: "Target Audience",
        impactValue: "420 Customers",
        impactValueClass: "text-tertiary",
        actionText: "Draft Campaign",
        actionClass: "bg-surface-container-high text-on-surface hover:bg-surface-variant"
      }
    ],
    approvalQueue: [
      {
        id: "1",
        agentName: "Revenue Agent",
        agentIcon: "smart_toy",
        agentClass: "bg-primary-fixed text-on-primary-fixed",
        status: "Awaiting Approval",
        title: "Create Weekend Grocery Bundle",
        description: "Proposing a bundle: 5kg Atta + 1L Sunflower Oil + 1kg Sugar at a 5% discount to clear excess oil inventory before expiration.",
        impactLabel: "Est. Impact: +?3,200",
        impactIcon: "trending_up",
        impactClass: "text-primary",
        timeGenerated: "Generated 2h ago",
        borderClass: "border-primary"
      },
      {
        id: "2",
        agentName: "Procurement Agent",
        agentIcon: "smart_toy",
        agentClass: "bg-secondary-fixed text-on-secondary-fixed",
        status: "Awaiting Approval",
        title: "Switch Supplier for Dal Products",
        description: "Recommend switching from 'Metro Wholesalers' to 'AgriFresh Direct' for Toor and Moong Dal based on recent pricing trends and delivery reliability scores.",
        impactLabel: "Est. Saving: 8% Margin",
        impactIcon: "savings",
        impactClass: "text-secondary",
        timeGenerated: "Generated 5h ago",
        borderClass: "border-secondary"
      }
    ],
    efficacy: {
      actionsExecuted: "142",
      trend: "12%",
      trendDirection: "arrow_upward",
      chartData: [12, 18, 9, 24, 31, 48],
      labels: ["W1", "W2", "W3", "W4", "W5", "Now"]
    },
    governance: [
      {
        id: "1",
        name: "Pricing Actions",
        description: "Discounts, markups, bundles",
        icon: "payments",
        iconBgClass: "bg-primary-container/20",
        iconColorClass: "text-primary-container",
        mode: "Manual"
      },
      {
        id: "2",
        name: "Procurement",
        description: "PO creation, supplier switching",
        icon: "inventory",
        iconBgClass: "bg-secondary-container/20",
        iconColorClass: "text-secondary-container",
        mode: "Manual"
      },
      {
        id: "3",
        name: "Marketing",
        description: "SMS, loyalty rewards",
        icon: "campaign",
        iconBgClass: "bg-tertiary-container/20",
        iconColorClass: "text-tertiary-container",
        mode: "Auto"
      }
    ]
  };
};

export interface DbSupplierProduct {
  id: string;
  supplierId: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  wholesalePrice: number;
  minOrderQty: number;
  sku?: string;
  imageUrl?: string;
  inStock: boolean;
}

export interface DbSupplier {
  id: string;
  name: string;
  companyName?: string;
  phone: string;
  email?: string;
  category?: string;
  address?: string;
  city?: string;
  rating: number;
  paymentTerms?: string;
  products: DbSupplierProduct[];
}

export interface DbPurchaseOrder {
  id: string;
  poNumber: string;
  storeId: string;
  supplierId: string;
  status: 'draft' | 'sent' | 'confirmed' | 'shipped' | 'received' | 'cancelled';
  totalAmount: number;
  notes?: string;
  expectedDelivery?: string;
  createdAt: string;
  supplier: DbSupplier;
  items: Array<{
    id: string;
    productId?: string;
    supplierProductId?: string;
    name: string;
    qty: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

export const getSuppliersApi = async (): Promise<DbSupplier[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/suppliers`);
    const json = await res.json();
    if (json.success) {
      return json.data;
    }
  } catch (err) {
    console.error("Failed to fetch suppliers", err);
  }
  return [];
};

export const getPurchaseOrdersApi = async (): Promise<DbPurchaseOrder[]> => {
  try {
    const storeId = await getStoreId();
    if (!storeId) return [];
    const res = await fetch(`${API_BASE_URL}/api/merchant/${storeId}/purchase-orders`, {
      headers: { 'x-user-id': getMerchantToken() }
    });
    const json = await res.json();
    if (json.success) {
      return json.data;
    }
  } catch (err) {
    console.error("Failed to fetch purchase orders", err);
  }
  return [];
};

export const createPurchaseOrderApi = async (poData: {
  supplierId: string;
  items: Array<{ productId?: string; supplierProductId?: string; name: string; qty: number; unitPrice: number }>;
  notes?: string;
}): Promise<DbPurchaseOrder> => {
  const storeId = await getStoreId();
  if (!storeId) throw new Error("No store ID");
  const res = await fetch(`${API_BASE_URL}/api/merchant/${storeId}/purchase-orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': getMerchantToken()
    },
    body: JSON.stringify(poData)
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || 'Failed to create purchase order');
  }
  return json.data;
};

export const receivePurchaseOrderShipmentApi = async (poId: string): Promise<void> => {
  const storeId = await getStoreId();
  if (!storeId) throw new Error("No store ID");
  const res = await fetch(`${API_BASE_URL}/api/merchant/${storeId}/purchase-orders/${poId}/receive`, {
    method: 'PATCH',
    headers: {
      'x-user-id': getMerchantToken()
    }
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || 'Failed to receive shipment');
  }
};
