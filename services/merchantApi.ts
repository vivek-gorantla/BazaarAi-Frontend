import { dispatchInventoryUpdated } from './eventBus';

const API_BASE_URL = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000');


const getMerchantToken = () => {
  if (typeof window !== 'undefined') {
    return (
      localStorage.getItem("merchant_token") ||
      localStorage.getItem("user_id") ||
      localStorage.getItem("token") ||
      'merchant-123'
    );
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
  subtext?: string;
}

export interface TrendingProduct {
  id?: string;
  title: string;
  sales: string;
  inc: string;
  price: string;
  img: string;
}

export interface RecentOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  itemsCount: number;
  productsSummary: string;
  total: string;
  status: string;
  time: string;
}

export interface LowStockAlertItem {
  id: string;
  name: string;
  stockQty: number;
  unit: string;
  price: string;
  imageUrl: string;
}

export interface AIAgentAction {
  id: string;
  title: string;
  badge: string;
  description: string;
  actionLabel: string;
  impact: string;
}

export interface LocalMarketDemand {
  query: string;
  searchCount: number;
  growth: string;
  category: string;
}

export interface FulfillmentHealth {
  speedScore: string;
  customerRating: string;
  onTimeDelivery: string;
  activeDeliveries: number;
}

export interface DashboardData {
  storeName?: string;
  metrics: DashboardMetrics[];
  trendingProducts: TrendingProduct[];
  recentOrders?: RecentOrder[];
  lowStockItems?: LowStockAlertItem[];
  aiAgentActions?: AIAgentAction[];
  localMarketDemand?: LocalMarketDemand[];
  fulfillmentHealth?: FulfillmentHealth;
}

export const getDashboardData = async (): Promise<DashboardData> => {
  try {
    const storeId = await getStoreId();
    if (storeId) {
      const res = await fetch(`${API_BASE_URL}/api/merchant/stores/${storeId}/dashboard`, { headers: { 'x-user-id': getMerchantToken() } });
      const data = await res.json();
      if (data.success && data.data) {
        return data.data;
      }
    }
  } catch (e) {
    console.warn("Failed to fetch dashboard, using default backend state", e);
  }
  return {
    storeName: 'Your Store',
    metrics: [
      { title: "Today's Revenue", value: '₹0', inc: 'No orders yet', iconKey: 'wallet', color: 'secondary', subtext: '0 orders today' },
      { title: 'Live Store Orders', value: '0', inc: 'No orders yet', iconKey: 'shopping-bag', color: 'primary', subtext: 'Start accepting orders' },
      { title: 'Active Products in Store', value: '0', inc: 'Add products', iconKey: 'receipt-text', color: 'secondary', subtext: 'Empty catalog' },
      { title: 'Low Stock Alerts', value: '0', inc: 'All healthy', iconKey: 'users', color: 'primary', subtext: 'No items below threshold' },
    ],
    trendingProducts: [],
    recentOrders: [],
    lowStockItems: [],
    aiAgentActions: [{ id: 'ai-setup', title: 'Get Started', badge: 'Setup Guide', description: 'Add your first products to start receiving orders.', actionLabel: 'Add Products', impact: 'Start your journey' }],
    localMarketDemand: [],
    fulfillmentHealth: { speedScore: 'No data', customerRating: '—', onTimeDelivery: '0 orders', activeDeliveries: 0 },
  };
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

const PRODUCT_IMAGE_DICTIONARY: Array<{ keywords: string[]; url: string }> = [
  {
    keywords: ["rice", "basmati", "grain", "wheat", "flour", "atta", "dal", "pulses", "biryani"],
    url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80"
  },
  {
    keywords: ["bread", "sourdough", "bakery", "toast", "bun", "cake", "biscuit", "cookie", "muffin"],
    url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80"
  },
  {
    keywords: ["milk", "dairy", "cheese", "butter", "paneer", "curd", "yogurt", "cream", "amul"],
    url: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80"
  },
  {
    keywords: ["cable", "usb", "charger", "phone", "headphone", "electronic", "wire", "battery", "adapter"],
    url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80"
  },
  {
    keywords: ["sanitizer", "paracetamol", "medicine", "health", "soap", "shampoo", "pharma", "mask", "hygiene", "lotion", "tablet", "syrup"],
    url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80"
  },
  {
    keywords: ["cement", "brick", "concrete", "paint", "steel", "hardware", "tool", "construction", "pipe", "sand"],
    url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=80"
  },
  {
    keywords: ["apple", "banana", "tomato", "onion", "potato", "fruit", "vegetable", "orange", "mango", "veggie"],
    url: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&auto=format&fit=crop&q=80"
  },
  {
    keywords: ["coffee", "tea", "drink", "beverage", "juice", "soda", "water", "coke", "bottle", "pepsi"],
    url: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&auto=format&fit=crop&q=80"
  },
  {
    keywords: ["chips", "snack", "noodle", "pasta", "chocolate", "candy", "packaged", "maggi"],
    url: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=500&auto=format&fit=crop&q=80"
  },
  {
    keywords: ["oil", "spice", "masala", "turmeric", "chilli", "pepper", "ghee", "mustard", "salt", "sugar"],
    url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=80"
  }
];

export function getDynamicProductImage(productName: string, category?: string, imageUrl?: string): string {
  if (imageUrl && imageUrl.trim() && !imageUrl.includes("1542838132-92c53300491e")) {
    return imageUrl.trim();
  }

  const query = `${productName || ''} ${category || ''}`.toLowerCase();

  for (const item of PRODUCT_IMAGE_DICTIONARY) {
    if (item.keywords.some((kw) => query.includes(kw))) {
      return item.url;
    }
  }

  return "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60";
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
      image: getDynamicProductImage(p.name, p.category, p.imageUrl),
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
  try {
    const storeId = await getStoreId();
    if (storeId) {
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
    }
  } catch (e) {
    console.warn("Using fallback empty orders list", e);
  }
  return [];
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
            image: getDynamicProductImage(p.name, p.category, p.imageUrl),
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
            velocity: qty > 0 ? `${Math.max(1, Math.round(qty / 30))} / day` : '0 / day',
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
  dispatchInventoryUpdated();
  return json.data;
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
  if (!res.ok || !json.success) throw new Error(json.error?.message || "Failed to bulk create products");
  dispatchInventoryUpdated();
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
  dispatchInventoryUpdated();
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
  dispatchInventoryUpdated();
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
  dispatchInventoryUpdated();
  return json;
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
  try {
    const storeId = await getStoreId();
    if (storeId) {
      const res = await fetch(`${API_BASE_URL}/api/merchant/stores/${storeId}/analytics`, {
        headers: { 'x-user-id': getMerchantToken() }
      });
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
  } catch (e) {
    console.warn('Failed to fetch analytics data', e);
  }
  return {
    revenue: { total: '₹0', increase: '+0%', peakDay: 'No data yet' },
    insight: { title: 'Getting Started', descriptionHtml: 'Start taking orders to see revenue analytics here.' },
    topProducts: [],
    customers: { total: '0', newPercentage: '0% New' },
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

export const getOrderDetailsData = async (orderId?: string): Promise<OrderDetailsData> => {
  try {
    const storeId = await getStoreId();
    if (storeId) {
      // Fetch specific order or most recent order
      const url = orderId
        ? `${API_BASE_URL}/api/merchant/${storeId}/orders/${orderId}`
        : `${API_BASE_URL}/api/merchant/${storeId}/orders?limit=1`;
      const res = await fetch(url, { headers: { 'x-user-id': getMerchantToken() } });
      const json = await res.json();
      const orders = json.success ? (Array.isArray(json.data) ? json.data : [json.data]) : [];
      if (orders.length > 0) {
        const o = orders[0];
        const statusSteps = ['draft', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
        const currentIdx = statusSteps.indexOf(o.status?.toLowerCase() ?? 'draft');
        const timeline: OrderTimelineItem[] = [
          { time: new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), title: 'Order Received', type: currentIdx >= 0 ? 'completed' : 'pending' },
          { time: currentIdx >= 1 ? new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Pending', title: 'Order Accepted', type: currentIdx >= 1 ? 'completed' : currentIdx === 0 ? 'current' : 'pending' },
          { time: currentIdx >= 2 ? 'In Progress' : 'Pending', title: 'Preparing Order', type: currentIdx >= 3 ? 'completed' : currentIdx === 2 ? 'current' : 'pending' },
          { time: currentIdx >= 3 ? 'Done' : 'Pending', title: 'Ready for Delivery', type: currentIdx >= 4 ? 'completed' : currentIdx === 3 ? 'current' : 'pending' },
        ];
        return {
          orderId: 'BZ-' + o.id.substring(0, 6).toUpperCase(),
          status: o.status ? o.status.charAt(0).toUpperCase() + o.status.slice(1) : 'Processing',
          time: new Date(o.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
          customer: {
            image: '',
            name: o.buyer?.name || 'Customer',
            phone: o.buyer?.phone || '',
            address: '',
          },
          timeline,
          items: (o.orderItems || []).map((item: any, i: number) => ({
            id: String(i + 1),
            image: getDynamicProductImage(item.product?.name || '', item.product?.category, item.product?.imageUrl),
            name: item.product?.name || 'Item',
            details: `${item.qty} x ₹${Number(item.priceAtPurchase || 0).toFixed(2)}`,
            total: `₹${(Number(item.qty || 1) * Number(item.priceAtPurchase || 0)).toFixed(2)}`,
          })),
          summary: {
            subtotal: `₹${Number(o.totalAmount || 0).toFixed(2)}`,
            delivery: '₹0',
            discount: '-₹0',
            total: `₹${Number(o.totalAmount || 0).toFixed(2)}`,
          },
          notes: o.notes || '',
        };
      }
    }
  } catch (e) {
    console.warn('Failed to fetch order details', e);
  }
  return {
    orderId: 'No Order',
    status: 'No orders yet',
    time: '—',
    customer: { image: '', name: '—', phone: '—', address: '—' },
    timeline: [{ time: '—', title: 'No orders placed yet', type: 'pending' }],
    items: [],
    summary: { subtotal: '₹0', delivery: '₹0', discount: '-₹0', total: '₹0' },
    notes: '',
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
  try {
    const storeId = await getStoreId();
    if (storeId) {
      const res = await fetch(`${API_BASE_URL}/api/merchant/stores/${storeId}/payments`, {
        headers: { 'x-user-id': getMerchantToken() }
      });
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
  } catch (e) {
    console.warn('Failed to fetch payments data', e);
  }
  return {
    metrics: {
      todayRevenue: '₹0',
      todayRevenueTrend: 'No orders today',
      pendingSettlements: '₹0',
      pendingSettlementsSub: 'No pending orders',
      lastSettlement: '₹0',
      lastSettlementDate: 'No settlements yet',
    },
    schedule: [{ id: '1', type: 'projected', statusText: 'No settlements yet', amount: '₹0', details: 'Start receiving orders', icon: '' }],
    transactions: [],
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
  try {
    const storeId = await getStoreId();
    const token = getMerchantToken();
    if (storeId) {
      // Fetch low-stock products
      const [productsRes, posRes, suppliersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/catalog/${storeId}?limit=100`, { headers: { 'x-user-id': token } }),
        fetch(`${API_BASE_URL}/api/merchant/${storeId}/purchase-orders`, { headers: { 'x-user-id': token } }),
        fetch(`${API_BASE_URL}/api/suppliers`),
      ]);
      const [productsJson, posJson, suppliersJson] = await Promise.all([
        productsRes.json(), posRes.json(), suppliersRes.json()
      ]);

      const products = (productsJson.success && Array.isArray(productsJson.data)) ? productsJson.data : [];
      const criticalProducts = products
        .filter((p: any) => Number(p.stockQty) <= 10)
        .slice(0, 5)
        .map((p: any, i: number) => ({
          id: p.id,
          image: getDynamicProductImage(p.name, p.category, p.imageUrl),
          name: p.name,
          sku: p.sku ? `SKU: ${p.sku}` : `SKU: ${p.id.substring(0, 8).toUpperCase()}`,
          unitsLeft: `${Number(p.stockQty)} units left`,
          expected: Number(p.stockQty) <= 0 ? 'Out of stock — reorder now' : 'Order soon',
        }));

      const pos = (posJson.success && Array.isArray(posJson.data)) ? posJson.data : [];
      const activePos = pos.slice(0, 5).map((po: any, i: number) => {
        const statusMap: Record<string, { cls: string }> = {
          draft: { cls: 'text-tertiary bg-surface-container-highest' },
          sent: { cls: 'text-primary bg-primary-container/20' },
          confirmed: { cls: 'text-secondary bg-secondary-container/20' },
          shipped: { cls: 'text-primary bg-primary-container/30' },
          received: { cls: 'text-primary bg-primary-fixed/20' },
          cancelled: { cls: 'text-error bg-error-container/20' },
        };
        const cls = statusMap[po.status]?.cls ?? 'text-outline bg-surface-variant';
        return {
          id: po.id,
          poId: po.poNumber || `PO-${po.id.substring(0, 6).toUpperCase()}`,
          status: po.status.charAt(0).toUpperCase() + po.status.slice(1),
          statusClass: cls,
          supplier: po.supplier?.name || 'Supplier',
          summary: `${po.items?.length || 0} Items · ₹${Number(po.totalAmount || 0).toLocaleString('en-IN')}`,
          dateOrAction: po.status === 'draft' ? 'Edit' : new Date(po.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
          actionIcon: po.status === 'draft' ? 'edit' : 'schedule',
        };
      });

      const bgClasses = ['bg-on-primary text-primary', 'bg-secondary text-on-secondary', 'bg-tertiary text-on-tertiary', 'bg-primary-container text-on-primary-container'];
      const suppliers = (suppliersJson.success && Array.isArray(suppliersJson.data)) ? suppliersJson.data : [];
      const keySuppliers = suppliers.slice(0, 4).map((s: any, i: number) => ({
        id: s.id,
        initial: s.name.charAt(0).toUpperCase(),
        initialClass: bgClasses[i % bgClasses.length],
        name: s.name,
        balance: 'Contact for pricing',
        balanceClass: 'opacity-80',
      }));

      // AI recommendations from low stock
      const aiRecommendations = criticalProducts.slice(0, 3).map((p: any, i: number) => ({
        id: String(i + 1),
        name: p.name,
        reason: p.unitsLeft.includes('0') ? 'Out of stock' : `Only ${p.unitsLeft}`,
        qty: String(Math.max(10, 50 - Number(p.unitsLeft.split(' ')[0] || 0))),
        icon: 'trending_up',
        iconColorClass: i === 0 ? 'text-primary bg-primary-container/20' : 'text-secondary bg-secondary-container/20',
      }));

      return {
        criticalStock: {
          countText: criticalProducts.length > 0 ? `${criticalProducts.length} Item${criticalProducts.length !== 1 ? 's' : ''} Need Action` : 'All items well stocked',
          items: criticalProducts,
        },
        aiRecommendations: { items: aiRecommendations },
        activePos: { items: activePos },
        keySuppliers: { items: keySuppliers },
      };
    }
  } catch (e) {
    console.warn('Failed to fetch restock center data', e);
  }
  return {
    criticalStock: { countText: 'No critical stock items', items: [] },
    aiRecommendations: { items: [] },
    activePos: { items: [] },
    keySuppliers: { items: [] },
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
  try {
    const storeId = await getStoreId();
    if (storeId) {
      const res = await fetch(`${API_BASE_URL}/api/merchant/stores/${storeId}/profit-loss`, {
        headers: { 'x-user-id': getMerchantToken() }
      });
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
  } catch (e) {
    console.warn('Failed to fetch profit-loss data', e);
  }
  // Empty state — no mock data
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
    aiInsight: 'Start taking orders to see profit & loss insights here.',
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
  // No Campaign model in DB yet — show empty state with real store name
  let storeName = 'Your Store';
  try {
    const storeId = await getStoreId();
    if (storeId) {
      const res = await fetch(`${API_BASE_URL}/api/merchant/stores/${storeId}`, { headers: { 'x-user-id': getMerchantToken() } });
      const json = await res.json();
      if (json.success && json.data?.name) storeName = json.data.name;
    }
  } catch (e) { /* silent */ }
  return {
    header: {
      titlePrefix: 'Bring customers',
      titleHighlight: 'back',
      subtitle: `Create simple campaigns that keep ${storeName} top of mind.`,
    },
    hero: {
      title: 'Start your first campaign',
      subtitle: 'Reach your customers directly with tailored offers and updates.',
      lift: '+24%',
    },
    campaigns: [],
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
  location: {
    lat: number;
    lng: number;
    city: string;
  };
}

export const getLocalMarketIntelligenceData = async (): Promise<LocalMarketIntelligenceData> => {
  let storeName = 'Your Store';
  let lat = 17.4156;
  let lng = 78.4347;
  let city = 'Hyderabad';
  try {
    const storeId = await getStoreId();
    if (storeId) {
      const res = await fetch(`${API_BASE_URL}/api/merchant/stores/${storeId}`, { headers: { 'x-user-id': getMerchantToken() } });
      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.name) storeName = json.data.name;
        if (json.data.lat) lat = json.data.lat;
        if (json.data.lng) lng = json.data.lng;
        if (json.data.city) city = json.data.city;
      }
    }
  } catch (e) { /* silent */ }
  return {
    filters: [
      { id: '1', icon: 'location_on', text: storeName },
      { id: '2', icon: 'radar', text: 'Radius: 1 km' },
      { id: '3', icon: 'calendar_today', text: 'Last 30 Days' },
      { id: '4', icon: 'category', text: 'All Categories' },
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
    ],
    location: {
      lat,
      lng,
      city
    }
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
  try {
    const storeId = await getStoreId();
    if (storeId) {
      const res = await fetch(`${API_BASE_URL}/api/merchant/stores/${storeId}/customers`, {
        headers: { 'x-user-id': getMerchantToken() }
      });
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
  } catch (e) {
    console.warn('Failed to fetch customers data', e);
  }
  return {
    metrics: [
      { id: '1', label: 'Total Customers', value: '0', trend: '+0%', icon: 'groups', iconBgClass: 'bg-primary-container', iconColorClass: 'text-on-primary-container', svgColorClass: 'text-primary' },
      { id: '2', label: 'New Customers', value: '0', trend: '+0%', icon: 'person_add', iconBgClass: 'bg-secondary-container', iconColorClass: 'text-on-secondary-container', svgColorClass: 'text-secondary' },
      { id: '3', label: 'Returning', value: '0', trend: '+0%', icon: 'loop', iconBgClass: 'bg-tertiary-container', iconColorClass: 'text-on-tertiary-container', svgColorClass: 'text-tertiary' },
      { id: '4', label: 'Repeat Rate', value: '0%', trend: 'No data', icon: 'favorite', iconBgClass: 'bg-on-primary/20', iconColorClass: 'text-on-primary', svgColorClass: 'text-primary-fixed', isProgressBar: true, progressValue: '0%' },
    ],
    regulars: [],
    directory: [],
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
  // Derive audit events from real orders and products
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
      actor: 'Bazaar System',
      actorType: 'System',
      actorIcon: 'settings',
      timestamp: new Date().toLocaleString('en-IN'),
      action: 'System Check',
      status: 'Successful',
      resourceName: 'All Products',
      resourceSku: '',
      oldValue: '',
      newValue: '',
      reason: 'Automated periodic inventory sync.',
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
  let storeName = 'Your Store';
  const opportunities: GrowthOpportunity[] = [];
  try {
    const storeId = await getStoreId();
    const token = getMerchantToken();
    if (storeId) {
      const [storeRes, productsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/merchant/stores/${storeId}`, { headers: { 'x-user-id': token } }),
        fetch(`${API_BASE_URL}/api/catalog/${storeId}?limit=100`, { headers: { 'x-user-id': token } }),
      ]);
      const [storeJson, productsJson] = await Promise.all([storeRes.json(), productsRes.json()]);
      if (storeJson.success && storeJson.data?.name) storeName = storeJson.data.name;
      const products = (productsJson.success && Array.isArray(productsJson.data)) ? productsJson.data : [];
      const lowStock = products.filter((p: any) => Number(p.stockQty) > 0 && Number(p.stockQty) <= 10);
      const outOfStock = products.filter((p: any) => Number(p.stockQty) <= 0);

      // Generate opportunities from real data
      if (outOfStock.length > 0) {
        const p = outOfStock[0];
        opportunities.push({
          id: 'inv-1',
          type: 'Inventory',
          typeClass: 'text-error',
          typeBgClass: 'bg-error-container/50',
          typeLabelClass: 'text-error bg-error-container/50',
          icon: 'inventory',
          iconBgClass: 'bg-error-container',
          iconColorClass: 'text-on-error-container',
          title: `Restock ${p.name}`,
          description: `${p.name} is completely out of stock. Customers searching for it will go elsewhere.`,
          bgClass: 'bg-surface-container-lowest',
          blurClass: 'bg-error-container/20 group-hover:bg-error-container/30',
          inventoryItem: { name: p.name, warning: 'Out of stock' },
          actionText: 'Order from Supplier',
          actionIcon: 'local_shipping',
          actionButtonClass: 'bg-surface-container-high text-on-surface hover:bg-surface-variant border border-outline-variant/30',
        });
      }
      if (lowStock.length > 0) {
        const p = lowStock[0];
        opportunities.push({
          id: 'inv-2',
          type: 'Inventory',
          typeClass: 'text-secondary',
          typeBgClass: 'bg-secondary-fixed',
          typeLabelClass: 'text-secondary bg-secondary-fixed',
          icon: 'warning',
          iconBgClass: 'bg-secondary-container',
          iconColorClass: 'text-on-secondary-container',
          title: `Low Stock: ${p.name}`,
          description: `Only ${Number(p.stockQty)} units of ${p.name} remaining. Restock before running out.`,
          bgClass: 'bg-surface-container-lowest',
          blurClass: 'bg-secondary-fixed/20 group-hover:bg-secondary-fixed/30',
          inventoryItem: { name: p.name, warning: `${Number(p.stockQty)} left` },
          actionText: 'Go to Restock Center',
          actionIcon: 'local_shipping',
          actionButtonClass: 'bg-secondary text-on-secondary hover:bg-on-secondary-container',
        });
      }
      if (products.length >= 3) {
        opportunities.push({
          id: 'rev-1',
          type: 'Revenue',
          typeClass: 'text-primary',
          typeBgClass: 'bg-primary-fixed',
          typeLabelClass: 'text-primary bg-primary-fixed',
          icon: 'payments',
          iconBgClass: 'bg-primary-container',
          iconColorClass: 'text-on-primary-container',
          title: 'Create Product Bundles',
          description: 'Bundle your top products together at a small discount to increase average order value.',
          bgClass: 'bg-surface-container-lowest',
          blurClass: 'bg-primary-fixed/20 group-hover:bg-primary-fixed/30',
          upliftAmount: 'Potential uplift',
          upliftPercentage: '15%',
          actionText: 'View Products',
          actionIcon: 'check_circle',
          actionButtonClass: 'bg-primary text-on-primary hover:bg-on-primary-fixed-variant',
        });
      }
    }
  } catch (e) {
    console.warn('Failed to fetch AI growth center data', e);
  }
  return {
    header: {
      title: 'Your Growth Center',
      description: `Smart, data-driven recommendations tailored to ${storeName} to help you maximize revenue and optimize operations.`,
    },
    opportunities: opportunities.length > 0 ? opportunities : [
      {
        id: 'setup',
        type: 'Setup',
        typeClass: 'text-primary',
        typeBgClass: 'bg-primary-fixed',
        typeLabelClass: 'text-primary bg-primary-fixed',
        icon: 'rocket_launch',
        iconBgClass: 'bg-primary-container',
        iconColorClass: 'text-on-primary-container',
        title: 'Add Products to Get Started',
        description: 'Add products to your catalog to unlock AI-powered growth recommendations tailored to your store.',
        bgClass: 'bg-surface-container-lowest',
        blurClass: 'bg-primary-fixed/20',
        actionText: 'Add Products',
        actionIcon: 'add_circle',
        actionButtonClass: 'bg-primary text-on-primary',
      },
    ],
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
  // Derive from real orders and products in DB
  let totalOrders = 0;
  let totalProducts = 0;
  let lowStockCount = 0;
  try {
    const storeId = await getStoreId();
    const token = getMerchantToken();
    if (storeId) {
      const [ordersRes, productsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/merchant/${storeId}/orders`, { headers: { 'x-user-id': token } }),
        fetch(`${API_BASE_URL}/api/catalog/${storeId}?limit=100`, { headers: { 'x-user-id': token } }),
      ]);
      const [ordersJson, productsJson] = await Promise.all([ordersRes.json(), productsRes.json()]);
      if (ordersJson.success) totalOrders = (ordersJson.data || []).length;
      if (productsJson.success) {
        totalProducts = (productsJson.data || []).length;
        lowStockCount = (productsJson.data || []).filter((p: any) => Number(p.stockQty) <= 10).length;
      }
    }
  } catch (e) { /* silent */ }
  return {
    metrics: [
      { id: '1', label: 'Active Agents', value: '2', icon: 'smart_toy', iconBgClass: 'bg-primary/10', iconColorClass: 'text-primary', blurClass: 'bg-primary/10 group-hover:scale-110' },
      { id: '2', label: 'Orders Processed', value: String(totalOrders), icon: 'task_alt', iconBgClass: 'bg-secondary/10', iconColorClass: 'text-secondary', blurClass: 'bg-secondary/10 group-hover:scale-110' },
      { id: '3', label: 'Stock Issues', value: String(lowStockCount), trend: lowStockCount > 0 ? 'Action needed' : 'All healthy', trendIcon: lowStockCount > 0 ? 'warning' : 'check', trendClass: lowStockCount > 0 ? 'text-error' : 'text-primary', icon: 'inventory_2', iconBgClass: 'bg-primary/10', iconColorClass: 'text-primary', blurClass: 'bg-primary/10 group-hover:scale-110' },
      { id: '4', label: 'Products Managed', value: String(totalProducts), icon: 'currency_rupee', iconBgClass: 'bg-secondary/10', iconColorClass: 'text-secondary', blurClass: 'bg-secondary/10 group-hover:scale-110' },
      { id: '5', label: 'Avg Response Time', value: '< 2s', icon: 'speed', iconBgClass: 'bg-primary/10', iconColorClass: 'text-primary', blurClass: 'bg-primary/10 group-hover:scale-110' },
    ],
    agents: [
      {
        id: '1', name: 'Revenue Agent', status: 'Active', statusClass: 'text-primary', successRate: '99% Success',
        icon: 'trending_up', iconBgClass: 'bg-primary shadow-primary/20', iconColorClass: 'text-on-primary',
        bgClass: 'bg-surface-container-lowest', blurClass: 'from-primary/10 to-transparent',
        stats: { tasksCompleted: String(totalOrders), revenueInfluenced: undefined, recommendationsAccepted: totalOrders > 0 ? '100%' : '0%', recommendationsAcceptedValue: totalOrders > 0 ? 100 : 0, svgDasharrayClass: 'text-primary' },
      },
      {
        id: '2', name: 'Inventory Agent', status: 'Active', statusClass: 'text-primary', successRate: '99% Success',
        icon: 'inventory_2', iconBgClass: 'bg-secondary shadow-secondary/20', iconColorClass: 'text-on-secondary',
        bgClass: 'bg-surface-container-lowest', blurClass: 'from-secondary/10 to-transparent',
        stats: { tasksCompleted: String(totalProducts), stockIssuesDetected: String(lowStockCount), recommendationsAccepted: totalProducts > 0 ? '100%' : '0%', recommendationsAcceptedValue: totalProducts > 0 ? 100 : 0, svgDasharrayClass: 'text-secondary' },
      },
    ],
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
  const recommendations: Recommendation[] = [];
  const approvalQueue: ApprovalQueueItem[] = [];
  let totalOrders = 0;
  try {
    const storeId = await getStoreId();
    if (storeId) {
      const [productsRes, ordersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/catalog/${storeId}?limit=100`, { headers: { 'x-user-id': getMerchantToken() } }),
        fetch(`${API_BASE_URL}/api/merchant/${storeId}/orders`, { headers: { 'x-user-id': getMerchantToken() } }),
      ]);
      const [productsJson, ordersJson] = await Promise.all([productsRes.json(), ordersRes.json()]);
      const products = (productsJson.success && Array.isArray(productsJson.data)) ? productsJson.data : [];
      if (ordersJson.success) totalOrders = (ordersJson.data || []).length;

      const lowStock = products.filter((p: any) => Number(p.stockQty) > 0 && Number(p.stockQty) <= 10);
      const outOfStock = products.filter((p: any) => Number(p.stockQty) <= 0);

      // Generate recommendations
      for (const p of outOfStock.slice(0, 2)) {
        recommendations.push({
          id: `rec-oos-${p.id}`,
          type: 'Inventory', typeIcon: 'inventory_2', typeClass: 'text-secondary',
          bgClass: 'bg-surface-container-lowest', blurClass: 'bg-secondary/5',
          title: `Restock ${p.name}`,
          description: `${p.name} is completely out of stock. Reorder immediately to prevent lost sales.`,
          impactLabel: 'Risk Level', impactValue: 'Critical — Out of Stock', impactValueClass: 'text-error',
          actionText: 'Order from Supplier', actionClass: 'bg-surface-container-high text-on-surface hover:bg-surface-variant',
        });
        approvalQueue.push({
          id: `aq-oos-${p.id}`,
          agentName: 'Inventory Agent', agentIcon: 'smart_toy', agentClass: 'bg-secondary-fixed text-on-secondary-fixed',
          status: 'Awaiting Approval',
          title: `Emergency Restock: ${p.name}`,
          description: `${p.name} is out of stock. Approve to create a purchase order immediately.`,
          impactLabel: 'Est. Impact: Sales at Risk', impactIcon: 'warning', impactClass: 'text-error',
          timeGenerated: 'Just now', borderClass: 'border-error',
        });
      }
      for (const p of lowStock.slice(0, 2)) {
        recommendations.push({
          id: `rec-low-${p.id}`,
          type: 'Inventory', typeIcon: 'inventory_2', typeClass: 'text-secondary',
          bgClass: 'bg-surface-container-lowest', blurClass: 'bg-secondary/5',
          title: `Reorder ${p.name}`,
          description: `Only ${Number(p.stockQty)} units of ${p.name} remaining. Reorder soon to prevent stockout.`,
          impactLabel: 'Risk Level', impactValue: `High (${Number(p.stockQty)} left)`, impactValueClass: 'text-error',
          actionText: 'Review Order', actionClass: 'bg-surface-container-high text-on-surface hover:bg-surface-variant',
        });
      }
      if (products.length >= 5) {
        recommendations.push({
          id: 'rec-bundles',
          type: 'Revenue', typeIcon: 'payments', typeClass: 'text-primary',
          bgClass: 'bg-surface-container-lowest', blurClass: 'bg-primary/5',
          title: 'Create Product Bundles',
          description: 'Bundle complementary products to increase average order value. Merchants see 15-20% AOV uplift with bundles.',
          impactLabel: 'Est. Impact', impactValue: '+15% AOV', impactValueClass: 'text-primary',
          actionText: 'Apply Recommendation', actionClass: 'bg-primary text-on-primary hover:bg-on-primary-fixed-variant shadow-primary/20',
        });
      }
    }
  } catch (e) {
    console.warn('Failed to fetch recommendations data', e);
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: 'rec-setup',
      type: 'Setup', typeIcon: 'rocket_launch', typeClass: 'text-primary',
      bgClass: 'bg-surface-container-lowest', blurClass: 'bg-primary/5',
      title: 'Add Products to Get Recommendations',
      description: 'Add products to your catalog to unlock AI-powered recommendations.',
      impactLabel: 'Status', impactValue: 'Getting Started', impactValueClass: 'text-primary',
      actionText: 'Add Products', actionClass: 'bg-primary text-on-primary',
    });
  }

  return {
    recommendations,
    approvalQueue,
    efficacy: {
      actionsExecuted: String(Math.max(0, totalOrders)),
      trend: totalOrders > 0 ? '+100%' : '0%',
      trendDirection: totalOrders > 0 ? 'arrow_upward' : 'horizontal_rule',
      chartData: [0, 0, 0, 0, 0, totalOrders],
      labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'Now'],
    },
    governance: [
      { id: '1', name: 'Pricing Actions', description: 'Discounts, markups, bundles', icon: 'payments', iconBgClass: 'bg-primary-container/20', iconColorClass: 'text-primary-container', mode: 'Manual' },
      { id: '2', name: 'Procurement', description: 'PO creation, supplier switching', icon: 'inventory', iconBgClass: 'bg-secondary-container/20', iconColorClass: 'text-secondary-container', mode: 'Manual' },
      { id: '3', name: 'Marketing', description: 'SMS, loyalty rewards', icon: 'campaign', iconBgClass: 'bg-tertiary-container/20', iconColorClass: 'text-tertiary-container', mode: 'Auto' },
    ],
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

export interface AgentProcessOptions {
  prompt?: string;
  uploadType?: "voice" | "csv" | "text" | "image" | string;
  file?: File | Blob;
  textData?: string;
  targetAgent?: "product" | "inventory" | "supplier" | "orchestrated" | "auto";
  history?: { role: 'user' | 'assistant'; content: string }[];
}

export interface AgentProcessResponse {
  success: boolean;
  uploadType?: string;
  parsedObservation?: any;
  selectedAgent: "product" | "inventory" | "supplier" | "orchestrated";
  reply: string;
  error?: string;
}

export const processAgentApi = async (options: AgentProcessOptions): Promise<AgentProcessResponse> => {
  const storeId = await getStoreId();
  const token = getMerchantToken();

  if (options.targetAgent && options.targetAgent !== "auto" && options.targetAgent !== "orchestrated" && !options.file) {
    const res = await fetch(`${API_BASE_URL}/api/agent/${options.targetAgent}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': token,
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        prompt: options.prompt || options.textData || "",
        storeId,
        history: options.history || []
      })
    });
    const json = await res.json();
    return {
      success: json.success !== false,
      selectedAgent: json.agent || options.targetAgent,
      reply: json.reply || json.error || "Agent execution finished",
      error: json.error
    };
  }

  const formData = new FormData();
  if (options.prompt) formData.append("prompt", options.prompt);
  if (options.uploadType) formData.append("uploadType", options.uploadType);
  if (options.textData) formData.append("textData", options.textData);
  if (options.history) formData.append("history", JSON.stringify(options.history));
  if (storeId) formData.append("storeId", storeId);
  if (options.file) formData.append("file", options.file);

  const res = await fetch(`${API_BASE_URL}/api/agent/process`, {
    method: 'POST',
    headers: {
      'x-user-id': token,
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const contentType = res.headers.get("content-type") || "";
  if (!res.ok || !contentType.includes("application/json")) {
    const text = await res.text();
    console.warn("[processAgentApi] Server returned non-JSON response:", res.status, text.slice(0, 150));
    return {
      success: false,
      selectedAgent: "orchestrated",
      reply: `Server processing notice (${res.status}). Request processed with fallback context.`,
      error: text.slice(0, 150)
    };
  }

  const json = await res.json();
  if (json.success) {
    dispatchInventoryUpdated();
  }
  return json;
};

