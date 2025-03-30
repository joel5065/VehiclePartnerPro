import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';
import {
  User, InsertUser, Category, InsertCategory, VehicleMake, InsertVehicleMake,
  VehicleModel, InsertVehicleModel, VehicleEngine, InsertVehicleEngine,
  Product, InsertProduct, UserVehicle, InsertUserVehicle,
  MaintenanceItem, InsertMaintenanceItem, Order, InsertOrder,
  OrderItem, InsertOrderItem, CartItem, InsertCartItem
} from '../shared/schema';
import { IStorage } from './storage';
import { eq, like, and } from 'drizzle-orm';

// Initialize postgres client
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client, { schema });

export class PostgresStorage implements IStorage {
  
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(schema.users).values(user).returning();
    return result[0];
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return db.select().from(schema.categories);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const result = await db.select().from(schema.categories).where(eq(schema.categories.id, id));
    return result[0];
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(schema.categories).values(category).returning();
    return result[0];
  }

  // Vehicle Makes
  async getVehicleMakes(): Promise<VehicleMake[]> {
    return db.select().from(schema.vehicleMakes);
  }

  async getVehicleMake(id: number): Promise<VehicleMake | undefined> {
    const result = await db.select().from(schema.vehicleMakes).where(eq(schema.vehicleMakes.id, id));
    return result[0];
  }

  async createVehicleMake(make: InsertVehicleMake): Promise<VehicleMake> {
    const result = await db.insert(schema.vehicleMakes).values(make).returning();
    return result[0];
  }

  // Vehicle Models
  async getVehicleModels(makeId?: number): Promise<VehicleModel[]> {
    if (makeId) {
      return db.select().from(schema.vehicleModels).where(eq(schema.vehicleModels.makeId, makeId));
    }
    return db.select().from(schema.vehicleModels);
  }

  async getVehicleModel(id: number): Promise<VehicleModel | undefined> {
    const result = await db.select().from(schema.vehicleModels).where(eq(schema.vehicleModels.id, id));
    return result[0];
  }

  async createVehicleModel(model: InsertVehicleModel): Promise<VehicleModel> {
    const result = await db.insert(schema.vehicleModels).values(model).returning();
    return result[0];
  }

  // Vehicle Engines
  async getVehicleEngines(modelId?: number): Promise<VehicleEngine[]> {
    if (modelId) {
      return db.select().from(schema.vehicleEngines).where(eq(schema.vehicleEngines.modelId, modelId));
    }
    return db.select().from(schema.vehicleEngines);
  }

  async getVehicleEngine(id: number): Promise<VehicleEngine | undefined> {
    const result = await db.select().from(schema.vehicleEngines).where(eq(schema.vehicleEngines.id, id));
    return result[0];
  }

  async createVehicleEngine(engine: InsertVehicleEngine): Promise<VehicleEngine> {
    const result = await db.insert(schema.vehicleEngines).values(engine).returning();
    return result[0];
  }

  // Products
  async getProducts(categoryId?: number, compatibleWith?: number): Promise<Product[]> {
    // When no filters are applied
    if (!categoryId && !compatibleWith) {
      return db.select().from(schema.products);
    }

    // When only categoryId filter is applied
    if (categoryId && !compatibleWith) {
      return db.select().from(schema.products).where(eq(schema.products.categoryId, categoryId));
    }

    // When only compatibleWith filter is applied
    if (!categoryId && compatibleWith) {
      // For now, we're not filtering by compatibility in PostgreSQL
      // This would require a better schema with a proper join table
      // We'll handle compatibility filtering in the application code for now
      return db.select().from(schema.products);
    }

    // When both filters are applied
    if (categoryId && compatibleWith) {
      return db.select().from(schema.products).where(eq(schema.products.categoryId, categoryId));
    }

    return db.select().from(schema.products);
  }

  async searchProducts(query: string): Promise<Product[]> {
    return db.select().from(schema.products).where(
      like(schema.products.name, `%${query}%`)
    );
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const result = await db.select().from(schema.products).where(eq(schema.products.id, id));
    return result[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(schema.products).values(product).returning();
    return result[0];
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db.update(schema.products)
      .set(product)
      .where(eq(schema.products.id, id))
      .returning();
    return result[0];
  }

  // User Vehicles
  async getUserVehicles(userId: number): Promise<UserVehicle[]> {
    return db.select().from(schema.userVehicles).where(eq(schema.userVehicles.userId, userId));
  }

  async getUserVehicle(id: number): Promise<UserVehicle | undefined> {
    const result = await db.select().from(schema.userVehicles).where(eq(schema.userVehicles.id, id));
    return result[0];
  }

  async createUserVehicle(vehicle: InsertUserVehicle): Promise<UserVehicle> {
    const result = await db.insert(schema.userVehicles).values(vehicle).returning();
    return result[0];
  }

  async updateUserVehicle(id: number, vehicle: Partial<InsertUserVehicle>): Promise<UserVehicle | undefined> {
    const result = await db.update(schema.userVehicles)
      .set(vehicle)
      .where(eq(schema.userVehicles.id, id))
      .returning();
    return result[0];
  }

  async deleteUserVehicle(id: number): Promise<boolean> {
    await db.delete(schema.userVehicles).where(eq(schema.userVehicles.id, id));
    return true;
  }

  // Maintenance Items
  async getMaintenanceItems(): Promise<MaintenanceItem[]> {
    return db.select().from(schema.maintenanceItems);
  }

  async getMaintenanceItem(id: number): Promise<MaintenanceItem | undefined> {
    const result = await db.select().from(schema.maintenanceItems).where(eq(schema.maintenanceItems.id, id));
    return result[0];
  }

  async getMaintenanceSchedule(vehicleId: number): Promise<MaintenanceItem[]> {
    // This would need a more complex query based on the maintenance schedule
    // For simplicity, we'll return all maintenance items
    // In a real app, this would be filtered based on the vehicle's specifications
    return this.getMaintenanceItems();
  }

  async createMaintenanceItem(item: InsertMaintenanceItem): Promise<MaintenanceItem> {
    const result = await db.insert(schema.maintenanceItems).values(item).returning();
    return result[0];
  }

  // Orders
  async getOrders(userId: number): Promise<Order[]> {
    return db.select().from(schema.orders).where(eq(schema.orders.userId, userId));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const result = await db.select().from(schema.orders).where(eq(schema.orders.id, id));
    return result[0];
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    // Set order date to current time
    const orderWithDate = { ...order, orderDate: new Date() };
    const result = await db.insert(schema.orders).values(orderWithDate).returning();
    return result[0];
  }

  async updateOrderStatus(id: number, status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"): Promise<Order | undefined> {
    const result = await db.update(schema.orders)
      .set({ status })
      .where(eq(schema.orders.id, id))
      .returning();
    return result[0];
  }

  // Order Items
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, orderId));
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const result = await db.insert(schema.orderItems).values(item).returning();
    return result[0];
  }

  // Cart Items
  async getCartItems(userId: number): Promise<CartItem[]> {
    return db.select().from(schema.cartItems).where(eq(schema.cartItems.userId, userId));
  }

  async getCartItem(userId: number, productId: number): Promise<CartItem | undefined> {
    const result = await db.select().from(schema.cartItems).where(
      and(
        eq(schema.cartItems.userId, userId),
        eq(schema.cartItems.productId, productId)
      )
    );
    return result[0];
  }

  async createCartItem(item: InsertCartItem): Promise<CartItem> {
    // Set added at to current time
    const itemWithDate = { ...item, addedAt: new Date() };
    const result = await db.insert(schema.cartItems).values(itemWithDate).returning();
    return result[0];
  }

  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const result = await db.update(schema.cartItems)
      .set({ quantity })
      .where(eq(schema.cartItems.id, id))
      .returning();
    return result[0];
  }

  async deleteCartItem(id: number): Promise<boolean> {
    await db.delete(schema.cartItems).where(eq(schema.cartItems.id, id));
    return true;
  }

  async clearCart(userId: number): Promise<boolean> {
    await db.delete(schema.cartItems).where(eq(schema.cartItems.userId, userId));
    return true;
  }
}

export const pgStorage = new PostgresStorage();