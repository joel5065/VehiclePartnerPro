import { apiRequest } from "./queryClient";

export interface RegisterUserParams {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
}

export interface LoginParams {
  username: string;
  password: string;
}

export interface CartItemParams {
  userId: number;
  productId: number;
  quantity: number;
}

export interface VehicleParams {
  userId: number;
  makeId: number;
  modelId: number;
  year: number;
  engineId?: number;
  mileage: number;
  purchaseDate?: string;
  annualMileage?: number;
  harshWeather?: boolean;
  cityDriving?: boolean;
  regularTowing?: boolean;
}

export interface OrderParams {
  userId: number;
  total: number;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
}

export interface OrderItemParams {
  productId: number;
  quantity: number;
  price: number;
}

// User API
export const registerUser = async (userData: RegisterUserParams) => {
  const res = await apiRequest("POST", "/api/users/register", userData);
  return res.json();
};

export const loginUser = async (credentials: LoginParams) => {
  const res = await apiRequest("POST", "/api/users/login", credentials);
  return res.json();
};

// Category API
export const getCategories = async () => {
  const res = await apiRequest("GET", "/api/categories");
  return res.json();
};

// Vehicle API
export const getVehicleMakes = async () => {
  const res = await apiRequest("GET", "/api/vehicle-makes");
  return res.json();
};

export const getVehicleModels = async (makeId?: number) => {
  const url = makeId ? `/api/vehicle-models?makeId=${makeId}` : "/api/vehicle-models";
  const res = await apiRequest("GET", url);
  return res.json();
};

export const getVehicleEngines = async (modelId?: number) => {
  const url = modelId ? `/api/vehicle-engines?modelId=${modelId}` : "/api/vehicle-engines";
  const res = await apiRequest("GET", url);
  return res.json();
};

export const getUserVehicles = async (userId: number) => {
  const res = await apiRequest("GET", `/api/user-vehicles/${userId}`);
  return res.json();
};

export const registerVehicle = async (vehicleData: VehicleParams) => {
  const res = await apiRequest("POST", "/api/user-vehicles", vehicleData);
  return res.json();
};

export const updateVehicle = async (id: number, vehicleData: Partial<VehicleParams>) => {
  const res = await apiRequest("PUT", `/api/user-vehicles/${id}`, vehicleData);
  return res.json();
};

export const deleteVehicle = async (id: number) => {
  await apiRequest("DELETE", `/api/user-vehicles/${id}`);
  return true;
};

// Product API
export const getProducts = async (categoryId?: number, compatibleWith?: number) => {
  let url = "/api/products";
  
  if (categoryId || compatibleWith) {
    url += "?";
    if (categoryId) {
      url += `categoryId=${categoryId}`;
    }
    if (compatibleWith) {
      url += categoryId ? `&compatibleWith=${compatibleWith}` : `compatibleWith=${compatibleWith}`;
    }
  }
  
  const res = await apiRequest("GET", url);
  return res.json();
};

export const searchProducts = async (query: string) => {
  const res = await apiRequest("GET", `/api/products/search?q=${encodeURIComponent(query)}`);
  return res.json();
};

export const getProduct = async (id: number) => {
  const res = await apiRequest("GET", `/api/products/${id}`);
  return res.json();
};

// Cart API
export const getCart = async (userId: number) => {
  const res = await apiRequest("GET", `/api/cart/${userId}`);
  return res.json();
};

export const addToCart = async (cartItem: CartItemParams) => {
  const res = await apiRequest("POST", "/api/cart", cartItem);
  return res.json();
};

export const updateCartItemQuantity = async (id: number, quantity: number) => {
  const res = await apiRequest("PUT", `/api/cart/${id}`, { quantity });
  return res.json();
};

export const removeCartItem = async (id: number) => {
  await apiRequest("DELETE", `/api/cart/${id}`);
  return true;
};

export const clearCart = async (userId: number) => {
  await apiRequest("DELETE", `/api/cart/user/${userId}`);
  return true;
};

// Maintenance API
export const getMaintenanceItems = async () => {
  const res = await apiRequest("GET", "/api/maintenance-items");
  return res.json();
};

export const getMaintenanceSchedule = async (vehicleId: number) => {
  const res = await apiRequest("GET", `/api/maintenance-schedule/${vehicleId}`);
  return res.json();
};

// Order API
export const getOrders = async (userId: number) => {
  const res = await apiRequest("GET", `/api/orders/${userId}`);
  return res.json();
};

export const createOrder = async (order: OrderParams, items: OrderItemParams[]) => {
  const res = await apiRequest("POST", "/api/orders", { order, items });
  return res.json();
};

export const updateOrderStatus = async (id: number, status: string) => {
  const res = await apiRequest("PUT", `/api/orders/${id}/status`, { status });
  return res.json();
};
