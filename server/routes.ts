import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { IStorage } from "./storage";
import { z } from "zod";
import {
  insertUserSchema,
  insertUserVehicleSchema,
  insertCartItemSchema,
  insertOrderSchema,
  insertOrderItemSchema,
} from "@shared/schema";

export function registerRoutes(app: Express, storage: IStorage): Server {
  // All API routes prefixed with /api
  
  // Categories API
  app.get("/api/categories", async (req: Request, res: Response) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });
  
  // Vehicle Makes API
  app.get("/api/vehicle-makes", async (req: Request, res: Response) => {
    const makes = await storage.getVehicleMakes();
    res.json(makes);
  });
  
  // Vehicle Models API
  app.get("/api/vehicle-models", async (req: Request, res: Response) => {
    const makeId = req.query.makeId ? Number(req.query.makeId) : undefined;
    const models = await storage.getVehicleModels(makeId);
    res.json(models);
  });
  
  // Vehicle Engines API
  app.get("/api/vehicle-engines", async (req: Request, res: Response) => {
    const modelId = req.query.modelId ? Number(req.query.modelId) : undefined;
    const engines = await storage.getVehicleEngines(modelId);
    res.json(engines);
  });
  
  // Products API
  app.get("/api/products", async (req: Request, res: Response) => {
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
    const compatibleWith = req.query.compatibleWith ? Number(req.query.compatibleWith) : undefined;
    const products = await storage.getProducts(categoryId, compatibleWith);
    res.json(products);
  });
  
  app.get("/api/products/search", async (req: Request, res: Response) => {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }
    
    const products = await storage.searchProducts(query);
    res.json(products);
  });
  
  app.get("/api/products/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const product = await storage.getProduct(id);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json(product);
  });
  
  // Users API
  app.post("/api/users/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      
      // Don't return the password in the response
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "An error occurred" });
    }
  });
  
  app.post("/api/users/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    const user = await storage.getUserByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Don't return the password in the response
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
  
  // User Vehicles API
  app.get("/api/user-vehicles/:userId", async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    const vehicles = await storage.getUserVehicles(userId);
    res.json(vehicles);
  });
  
  app.post("/api/user-vehicles", async (req: Request, res: Response) => {
    try {
      const vehicleData = insertUserVehicleSchema.parse(req.body);
      const vehicle = await storage.createUserVehicle(vehicleData);
      res.status(201).json(vehicle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "An error occurred" });
    }
  });
  
  app.put("/api/user-vehicles/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
      const vehicleData = insertUserVehicleSchema.partial().parse(req.body);
      const updatedVehicle = await storage.updateUserVehicle(id, vehicleData);
      
      if (!updatedVehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      res.json(updatedVehicle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "An error occurred" });
    }
  });
  
  app.delete("/api/user-vehicles/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const success = await storage.deleteUserVehicle(id);
    
    if (!success) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    
    res.status(204).end();
  });
  
  // Maintenance Schedule API
  app.get("/api/maintenance-items", async (req: Request, res: Response) => {
    const items = await storage.getMaintenanceItems();
    res.json(items);
  });
  
  app.get("/api/maintenance-schedule/:vehicleId", async (req: Request, res: Response) => {
    const vehicleId = Number(req.params.vehicleId);
    const schedule = await storage.getMaintenanceSchedule(vehicleId);
    res.json(schedule);
  });
  
  // Cart API
  app.get("/api/cart/:userId", async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    const cartItems = await storage.getCartItems(userId);
    
    // Fetch product details for each cart item
    const cartWithProducts = await Promise.all(
      cartItems.map(async (item) => {
        const product = await storage.getProduct(item.productId);
        return {
          ...item,
          product
        };
      })
    );
    
    res.json(cartWithProducts);
  });
  
  app.post("/api/cart", async (req: Request, res: Response) => {
    try {
      const cartItemData = insertCartItemSchema.parse(req.body);
      const cartItem = await storage.createCartItem(cartItemData);
      
      // Fetch product details
      const product = await storage.getProduct(cartItem.productId);
      
      res.status(201).json({
        ...cartItem,
        product
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "An error occurred" });
    }
  });
  
  app.put("/api/cart/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { quantity } = req.body;
    
    if (quantity === undefined) {
      return res.status(400).json({ message: "Quantity is required" });
    }
    
    const updatedCartItem = await storage.updateCartItemQuantity(id, quantity);
    
    if (!updatedCartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    
    if (quantity <= 0) {
      return res.status(200).json({ message: "Item removed from cart" });
    }
    
    // Fetch product details
    const product = await storage.getProduct(updatedCartItem.productId);
    
    res.json({
      ...updatedCartItem,
      product
    });
  });
  
  app.delete("/api/cart/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const success = await storage.deleteCartItem(id);
    
    if (!success) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    
    res.status(204).end();
  });
  
  app.delete("/api/cart/user/:userId", async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    await storage.clearCart(userId);
    res.status(204).end();
  });
  
  // Orders API
  app.get("/api/orders/:userId", async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    const orders = await storage.getOrders(userId);
    
    // Fetch order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await storage.getOrderItems(order.id);
        
        // Fetch product details for each order item
        const itemsWithProducts = await Promise.all(
          items.map(async (item) => {
            const product = await storage.getProduct(item.productId);
            return {
              ...item,
              product
            };
          })
        );
        
        return {
          ...order,
          items: itemsWithProducts
        };
      })
    );
    
    res.json(ordersWithItems);
  });
  
  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      const { order, items } = req.body;
      
      // Validate order data
      const orderData = insertOrderSchema.parse(order);
      
      // Create order
      const newOrder = await storage.createOrder(orderData);
      
      // Create order items
      const orderItems = await Promise.all(
        items.map(async (item: any) => {
          const orderItemData = insertOrderItemSchema.parse({
            ...item,
            orderId: newOrder.id
          });
          
          return storage.createOrderItem(orderItemData);
        })
      );
      
      // Clear the user's cart
      await storage.clearCart(orderData.userId);
      
      // Fetch product details for each order item
      const itemsWithProducts = await Promise.all(
        orderItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product
          };
        })
      );
      
      res.status(201).json({
        ...newOrder,
        items: itemsWithProducts
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "An error occurred" });
    }
  });
  
  app.put("/api/orders/:id/status", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { status } = req.body;
    
    if (!status || !["pending", "processing", "shipped", "delivered", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Valid status is required" });
    }
    
    const updatedOrder = await storage.updateOrderStatus(id, status as any);
    
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    res.json(updatedOrder);
  });

  return createServer(app);
}
