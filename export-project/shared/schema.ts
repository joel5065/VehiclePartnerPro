import { pgTable, text, serial, integer, boolean, date, timestamp, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  phone: text("phone"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Product Categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

// Vehicle Makes and Models
export const vehicleMakes = pgTable("vehicle_makes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const insertVehicleMakeSchema = createInsertSchema(vehicleMakes).omit({
  id: true,
});

export const vehicleModels = pgTable("vehicle_models", {
  id: serial("id").primaryKey(),
  makeId: integer("make_id").notNull(),
  name: text("name").notNull(),
  yearStart: integer("year_start").notNull(),
  yearEnd: integer("year_end"),
});

export const insertVehicleModelSchema = createInsertSchema(vehicleModels).omit({
  id: true,
});

// Vehicle Engines
export const vehicleEngines = pgTable("vehicle_engines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  modelId: integer("model_id").notNull(),
});

export const insertVehicleEngineSchema = createInsertSchema(vehicleEngines).omit({
  id: true,
});

// Products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // Price in cents
  imageUrl: text("image_url"),
  categoryId: integer("category_id").notNull(),
  inStock: integer("in_stock").notNull().default(0),
  compatibleVehicles: json("compatible_vehicles").$type<number[]>(), // Array of vehicle model IDs
  rating: integer("rating").default(0), // 0-500 (0-5 stars with 100 = 1 star)
  reviewCount: integer("review_count").default(0),
  isTopRated: boolean("is_top_rated").default(false),
  isOnSale: boolean("is_on_sale").default(false),
  salePrice: integer("sale_price"), // Price in cents
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

// User Vehicles
export const userVehicles = pgTable("user_vehicles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  makeId: integer("make_id").notNull(),
  modelId: integer("model_id").notNull(),
  year: integer("year").notNull(),
  engineId: integer("engine_id"),
  mileage: integer("mileage").notNull(),
  purchaseDate: date("purchase_date"),
  annualMileage: integer("annual_mileage"),
  harshWeather: boolean("harsh_weather").default(false),
  cityDriving: boolean("city_driving").default(false),
  regularTowing: boolean("regular_towing").default(false),
});

export const insertUserVehicleSchema = createInsertSchema(userVehicles).omit({
  id: true,
});

// Maintenance Items
export const maintenanceItems = pgTable("maintenance_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  intervalMiles: integer("interval_miles").notNull(), // How often in miles
  intervalMonths: integer("interval_months"), // How often in months (if applicable)
  severeIntervalMiles: integer("severe_interval_miles"), // For severe conditions
  severeIntervalMonths: integer("severe_interval_months"),
  relatedProductIds: json("related_product_ids").$type<number[]>(), // Products for this maintenance
  applicableVehicles: json("applicable_vehicles").$type<number[]>(), // Array of vehicle model IDs
});

export const insertMaintenanceItemSchema = createInsertSchema(maintenanceItems).omit({
  id: true,
});

// Orders
export const orderStatusEnum = pgEnum("order_status", ["pending", "processing", "shipped", "delivered", "cancelled"]);

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  orderDate: timestamp("order_date").notNull().defaultNow(),
  status: orderStatusEnum("status").notNull().default("pending"),
  total: integer("total").notNull(), // Total in cents
  shippingAddress: text("shipping_address").notNull(),
  shippingCity: text("shipping_city").notNull(),
  shippingState: text("shipping_state").notNull(),
  shippingZip: text("shipping_zip").notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  orderDate: true,
});

// Order Items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(), // Price at time of purchase in cents
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

// Shopping Cart
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  addedAt: timestamp("added_at").notNull().defaultNow(),
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  addedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type VehicleMake = typeof vehicleMakes.$inferSelect;
export type InsertVehicleMake = z.infer<typeof insertVehicleMakeSchema>;

export type VehicleModel = typeof vehicleModels.$inferSelect;
export type InsertVehicleModel = z.infer<typeof insertVehicleModelSchema>;

export type VehicleEngine = typeof vehicleEngines.$inferSelect;
export type InsertVehicleEngine = z.infer<typeof insertVehicleEngineSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type UserVehicle = typeof userVehicles.$inferSelect;
export type InsertUserVehicle = z.infer<typeof insertUserVehicleSchema>;

export type MaintenanceItem = typeof maintenanceItems.$inferSelect;
export type InsertMaintenanceItem = z.infer<typeof insertMaintenanceItemSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
