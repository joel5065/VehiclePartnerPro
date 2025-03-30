import {
  User,
  InsertUser,
  Category,
  InsertCategory,
  VehicleMake,
  InsertVehicleMake,
  VehicleModel,
  InsertVehicleModel,
  VehicleEngine,
  InsertVehicleEngine,
  Product,
  InsertProduct,
  UserVehicle,
  InsertUserVehicle,
  MaintenanceItem,
  InsertMaintenanceItem,
  Order,
  InsertOrder,
  OrderItem,
  InsertOrderItem,
  CartItem,
  InsertCartItem,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Vehicle Makes
  getVehicleMakes(): Promise<VehicleMake[]>;
  getVehicleMake(id: number): Promise<VehicleMake | undefined>;
  createVehicleMake(make: InsertVehicleMake): Promise<VehicleMake>;

  // Vehicle Models
  getVehicleModels(makeId?: number): Promise<VehicleModel[]>;
  getVehicleModel(id: number): Promise<VehicleModel | undefined>;
  createVehicleModel(model: InsertVehicleModel): Promise<VehicleModel>;

  // Vehicle Engines
  getVehicleEngines(modelId?: number): Promise<VehicleEngine[]>;
  getVehicleEngine(id: number): Promise<VehicleEngine | undefined>;
  createVehicleEngine(engine: InsertVehicleEngine): Promise<VehicleEngine>;

  // Products
  getProducts(categoryId?: number, compatibleWith?: number): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;

  // User Vehicles
  getUserVehicles(userId: number): Promise<UserVehicle[]>;
  getUserVehicle(id: number): Promise<UserVehicle | undefined>;
  createUserVehicle(vehicle: InsertUserVehicle): Promise<UserVehicle>;
  updateUserVehicle(id: number, vehicle: Partial<InsertUserVehicle>): Promise<UserVehicle | undefined>;
  deleteUserVehicle(id: number): Promise<boolean>;

  // Maintenance Items
  getMaintenanceItems(): Promise<MaintenanceItem[]>;
  getMaintenanceItem(id: number): Promise<MaintenanceItem | undefined>;
  getMaintenanceSchedule(vehicleId: number): Promise<MaintenanceItem[]>;
  createMaintenanceItem(item: InsertMaintenanceItem): Promise<MaintenanceItem>;

  // Orders
  getOrders(userId: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"): Promise<Order | undefined>;

  // Order Items
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;

  // Cart Items
  getCartItems(userId: number): Promise<CartItem[]>;
  getCartItem(userId: number, productId: number): Promise<CartItem | undefined>;
  createCartItem(item: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined>;
  deleteCartItem(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private vehicleMakes: Map<number, VehicleMake>;
  private vehicleModels: Map<number, VehicleModel>;
  private vehicleEngines: Map<number, VehicleEngine>;
  private products: Map<number, Product>;
  private userVehicles: Map<number, UserVehicle>;
  private maintenanceItems: Map<number, MaintenanceItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private cartItems: Map<number, CartItem>;
  
  private userIdCounter: number;
  private categoryIdCounter: number;
  private makeIdCounter: number;
  private modelIdCounter: number;
  private engineIdCounter: number;
  private productIdCounter: number;
  private vehicleIdCounter: number;
  private maintenanceIdCounter: number;
  private orderIdCounter: number;
  private orderItemIdCounter: number;
  private cartItemIdCounter: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.vehicleMakes = new Map();
    this.vehicleModels = new Map();
    this.vehicleEngines = new Map();
    this.products = new Map();
    this.userVehicles = new Map();
    this.maintenanceItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.cartItems = new Map();
    
    this.userIdCounter = 1;
    this.categoryIdCounter = 1;
    this.makeIdCounter = 1;
    this.modelIdCounter = 1;
    this.engineIdCounter = 1;
    this.productIdCounter = 1;
    this.vehicleIdCounter = 1;
    this.maintenanceIdCounter = 1;
    this.orderIdCounter = 1;
    this.orderItemIdCounter = 1;
    this.cartItemIdCounter = 1;
    
    this.initializeData();
  }
  
  // Initialize with sample data
  private initializeData() {
    // Create categories
    const categories = [
      { name: "Oil & Fluids", description: "Engine oil, transmission fluid, brake fluid, etc.", icon: "fa-oil-can" },
      { name: "Batteries", description: "Car batteries and accessories", icon: "fa-car-battery" },
      { name: "Engine Parts", description: "Engine components and parts", icon: "fa-cogs" },
      { name: "Brakes", description: "Brake pads, rotors, calipers, etc.", icon: "fa-compress-arrows-alt" },
      { name: "Electrical", description: "Alternators, starters, and electrical components", icon: "fa-bolt" },
      { name: "Filters", description: "Air, oil, fuel, and cabin filters", icon: "fa-filter" }
    ];
    
    categories.forEach(category => this.createCategory(category));
    
    // Create vehicle makes
    const makes = ["Toyota", "Honda", "Ford", "Chevrolet", "BMW"];
    makes.forEach(make => this.createVehicleMake({ name: make }));
    
    // Create vehicle models for Toyota
    const toyotaId = 1;
    const toyotaModels = [
      { makeId: toyotaId, name: "Camry", yearStart: 2010, yearEnd: 2023 },
      { makeId: toyotaId, name: "Corolla", yearStart: 2010, yearEnd: 2023 },
      { makeId: toyotaId, name: "RAV4", yearStart: 2010, yearEnd: 2023 },
      { makeId: toyotaId, name: "Highlander", yearStart: 2010, yearEnd: 2023 }
    ];
    
    toyotaModels.forEach(model => this.createVehicleModel(model));
    
    // Create engines for Camry
    const camryId = 1;
    const camryEngines = [
      { modelId: camryId, name: "2.5L 4-Cylinder", description: "2.5L 4-Cylinder engine for Toyota Camry" },
      { modelId: camryId, name: "3.5L V6", description: "3.5L V6 engine for Toyota Camry" }
    ];
    
    camryEngines.forEach(engine => this.createVehicleEngine(engine));
    
    // Create sample products
    const products = [
      {
        name: "Premium Oil Filter",
        description: "High-quality oil filter compatible with Toyota and Honda vehicles",
        price: 1299, // $12.99
        imageUrl: "https://images.unsplash.com/photo-1600861195091-690f0e132e98",
        categoryId: 6, // Filters
        inStock: 100,
        compatibleVehicles: [1, 2], // Camry, Corolla
        rating: 450, // 4.5 stars
        reviewCount: 128,
        isTopRated: true,
        isOnSale: false
      },
      {
        name: "Ceramic Brake Pads",
        description: "High-performance ceramic brake pads for Toyota Camry and Corolla",
        price: 4999, // $49.99
        imageUrl: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023",
        categoryId: 4, // Brakes
        inStock: 50,
        compatibleVehicles: [1, 2], // Camry, Corolla
        rating: 500, // 5 stars
        reviewCount: 94,
        isTopRated: false,
        isOnSale: true,
        salePrice: 3999 // $39.99
      },
      {
        name: "Performance Air Filter",
        description: "Universal fit performance air filter for improved airflow",
        price: 2499, // $24.99
        imageUrl: "https://images.unsplash.com/photo-1614026480209-cd9934144671",
        categoryId: 6, // Filters
        inStock: 75,
        compatibleVehicles: [1, 2, 3, 4], // All Toyota models
        rating: 400, // 4 stars
        reviewCount: 67,
        isTopRated: false,
        isOnSale: false
      },
      {
        name: "Premium Wiper Blades",
        description: "22-inch all-weather wiper blades for clear visibility",
        price: 1899, // $18.99
        imageUrl: "https://images.unsplash.com/photo-1596113199003-03babc2bdd2b",
        categoryId: 5, // Electrical (closest category)
        inStock: 120,
        compatibleVehicles: [1, 2, 3, 4], // All Toyota models
        rating: 350, // 3.5 stars
        reviewCount: 42,
        isTopRated: false,
        isOnSale: false
      }
    ];
    
    products.forEach(product => this.createProduct(product));
    
    // Create maintenance items
    const maintenanceItems = [
      {
        name: "Oil Change",
        description: "Change engine oil and filter",
        intervalMiles: 5000,
        intervalMonths: 6,
        severeIntervalMiles: 3000,
        severeIntervalMonths: 3,
        relatedProductIds: [1], // Oil Filter
        applicableVehicles: [1, 2, 3, 4] // All Toyota models
      },
      {
        name: "Tire Rotation",
        description: "Rotate tires to ensure even wear",
        intervalMiles: 5000,
        intervalMonths: 6,
        severeIntervalMiles: 3000,
        severeIntervalMonths: 3,
        relatedProductIds: [],
        applicableVehicles: [1, 2, 3, 4] // All Toyota models
      },
      {
        name: "Air Filter Replacement",
        description: "Replace engine air filter",
        intervalMiles: 15000,
        intervalMonths: 12,
        severeIntervalMiles: 10000,
        severeIntervalMonths: 6,
        relatedProductIds: [3], // Performance Air Filter
        applicableVehicles: [1, 2, 3, 4] // All Toyota models
      },
      {
        name: "Cabin Filter Replacement",
        description: "Replace cabin air filter",
        intervalMiles: 15000,
        intervalMonths: 12,
        severeIntervalMiles: 10000,
        severeIntervalMonths: 6,
        relatedProductIds: [],
        applicableVehicles: [1, 2, 3, 4] // All Toyota models
      },
      {
        name: "Brake Inspection",
        description: "Inspect brake pads, rotors, and calipers",
        intervalMiles: 10000,
        intervalMonths: 12,
        severeIntervalMiles: 5000,
        severeIntervalMonths: 6,
        relatedProductIds: [2], // Ceramic Brake Pads
        applicableVehicles: [1, 2, 3, 4] // All Toyota models
      },
      {
        name: "Transmission Fluid Change",
        description: "Change automatic transmission fluid",
        intervalMiles: 30000,
        intervalMonths: 24,
        severeIntervalMiles: 15000,
        severeIntervalMonths: 12,
        relatedProductIds: [],
        applicableVehicles: [1, 2, 3, 4] // All Toyota models
      },
      {
        name: "Spark Plugs Replacement",
        description: "Replace spark plugs",
        intervalMiles: 60000,
        intervalMonths: 60,
        severeIntervalMiles: 30000,
        severeIntervalMonths: 30,
        relatedProductIds: [],
        applicableVehicles: [1, 2, 3, 4] // All Toyota models
      }
    ];
    
    maintenanceItems.forEach(item => this.createMaintenanceItem(item));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  // Vehicle make methods
  async getVehicleMakes(): Promise<VehicleMake[]> {
    return Array.from(this.vehicleMakes.values());
  }

  async getVehicleMake(id: number): Promise<VehicleMake | undefined> {
    return this.vehicleMakes.get(id);
  }

  async createVehicleMake(make: InsertVehicleMake): Promise<VehicleMake> {
    const id = this.makeIdCounter++;
    const newMake: VehicleMake = { ...make, id };
    this.vehicleMakes.set(id, newMake);
    return newMake;
  }

  // Vehicle model methods
  async getVehicleModels(makeId?: number): Promise<VehicleModel[]> {
    const models = Array.from(this.vehicleModels.values());
    if (makeId) {
      return models.filter(model => model.makeId === makeId);
    }
    return models;
  }

  async getVehicleModel(id: number): Promise<VehicleModel | undefined> {
    return this.vehicleModels.get(id);
  }

  async createVehicleModel(model: InsertVehicleModel): Promise<VehicleModel> {
    const id = this.modelIdCounter++;
    const newModel: VehicleModel = { ...model, id };
    this.vehicleModels.set(id, newModel);
    return newModel;
  }

  // Vehicle engine methods
  async getVehicleEngines(modelId?: number): Promise<VehicleEngine[]> {
    const engines = Array.from(this.vehicleEngines.values());
    if (modelId) {
      return engines.filter(engine => engine.modelId === modelId);
    }
    return engines;
  }

  async getVehicleEngine(id: number): Promise<VehicleEngine | undefined> {
    return this.vehicleEngines.get(id);
  }

  async createVehicleEngine(engine: InsertVehicleEngine): Promise<VehicleEngine> {
    const id = this.engineIdCounter++;
    const newEngine: VehicleEngine = { ...engine, id };
    this.vehicleEngines.set(id, newEngine);
    return newEngine;
  }

  // Product methods
  async getProducts(categoryId?: number, compatibleWith?: number): Promise<Product[]> {
    let products = Array.from(this.products.values());
    
    if (categoryId) {
      products = products.filter(product => product.categoryId === categoryId);
    }
    
    if (compatibleWith) {
      products = products.filter(product => 
        product.compatibleVehicles && 
        product.compatibleVehicles.includes(compatibleWith)
      );
    }
    
    return products;
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(product => 
      product.name.toLowerCase().includes(lowercaseQuery) || 
      product.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const newProduct: Product = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return undefined;
    
    const updatedProduct = { ...existingProduct, ...product };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  // User Vehicle methods
  async getUserVehicles(userId: number): Promise<UserVehicle[]> {
    return Array.from(this.userVehicles.values()).filter(
      vehicle => vehicle.userId === userId
    );
  }

  async getUserVehicle(id: number): Promise<UserVehicle | undefined> {
    return this.userVehicles.get(id);
  }

  async createUserVehicle(vehicle: InsertUserVehicle): Promise<UserVehicle> {
    const id = this.vehicleIdCounter++;
    const newVehicle: UserVehicle = { ...vehicle, id };
    this.userVehicles.set(id, newVehicle);
    return newVehicle;
  }

  async updateUserVehicle(id: number, vehicle: Partial<InsertUserVehicle>): Promise<UserVehicle | undefined> {
    const existingVehicle = this.userVehicles.get(id);
    if (!existingVehicle) return undefined;
    
    const updatedVehicle = { ...existingVehicle, ...vehicle };
    this.userVehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }

  async deleteUserVehicle(id: number): Promise<boolean> {
    return this.userVehicles.delete(id);
  }

  // Maintenance Item methods
  async getMaintenanceItems(): Promise<MaintenanceItem[]> {
    return Array.from(this.maintenanceItems.values());
  }

  async getMaintenanceItem(id: number): Promise<MaintenanceItem | undefined> {
    return this.maintenanceItems.get(id);
  }

  async getMaintenanceSchedule(vehicleId: number): Promise<MaintenanceItem[]> {
    const vehicle = await this.getUserVehicle(vehicleId);
    if (!vehicle) return [];
    
    const model = await this.getVehicleModel(vehicle.modelId);
    if (!model) return [];
    
    // Get maintenance items applicable to this vehicle model
    return Array.from(this.maintenanceItems.values()).filter(item => 
      item.applicableVehicles && item.applicableVehicles.includes(vehicle.modelId)
    );
  }

  async createMaintenanceItem(item: InsertMaintenanceItem): Promise<MaintenanceItem> {
    const id = this.maintenanceIdCounter++;
    const newItem: MaintenanceItem = { ...item, id };
    this.maintenanceItems.set(id, newItem);
    return newItem;
  }

  // Order methods
  async getOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      order => order.userId === userId
    ).sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderIdCounter++;
    const orderDate = new Date();
    const newOrder: Order = { ...order, id, orderDate };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateOrderStatus(id: number, status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"): Promise<Order | undefined> {
    const existingOrder = this.orders.get(id);
    if (!existingOrder) return undefined;
    
    const updatedOrder = { ...existingOrder, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Order Item methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      item => item.orderId === orderId
    );
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemIdCounter++;
    const newItem: OrderItem = { ...item, id };
    this.orderItems.set(id, newItem);
    return newItem;
  }

  // Cart Item methods
  async getCartItems(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      item => item.userId === userId
    );
  }

  async getCartItem(userId: number, productId: number): Promise<CartItem | undefined> {
    return Array.from(this.cartItems.values()).find(
      item => item.userId === userId && item.productId === productId
    );
  }

  async createCartItem(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists
    const existingItem = await this.getCartItem(item.userId, item.productId);
    if (existingItem) {
      // Update quantity instead
      return this.updateCartItemQuantity(existingItem.id, existingItem.quantity + item.quantity) as Promise<CartItem>;
    }
    
    const id = this.cartItemIdCounter++;
    const addedAt = new Date();
    const newItem: CartItem = { ...item, id, addedAt };
    this.cartItems.set(id, newItem);
    return newItem;
  }

  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const existingItem = this.cartItems.get(id);
    if (!existingItem) return undefined;
    
    if (quantity <= 0) {
      this.cartItems.delete(id);
      return { ...existingItem, quantity: 0 };
    }
    
    const updatedItem = { ...existingItem, quantity };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(userId: number): Promise<boolean> {
    const userCartItems = await this.getCartItems(userId);
    userCartItems.forEach(item => this.cartItems.delete(item.id));
    return true;
  }
}

// Import the PostgreSQL storage implementation
import { pgStorage } from './db';

// Choose whether to use PostgreSQL or memory storage based on environment
// In production, we'll always use PostgreSQL
const isProduction = process.env.NODE_ENV === 'production';
const usePostgresStorage = isProduction || process.env.DATABASE_URL;

// Export the appropriate storage implementation
export const storage = usePostgresStorage ? pgStorage : new MemStorage();
