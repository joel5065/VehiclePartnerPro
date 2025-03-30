// Import the database client directly from db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
//import dotenv from "dotenv";

// Environment variables are already loaded by the system

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not defined in the environment variables.");
  process.exit(1);
}

// Initialize postgres client
const client = postgres(process.env.DATABASE_URL);

// Initialize drizzle with the client
const db = drizzle(client);
import * as schema from '../shared/schema';

/**
 * Initializes the database with sample data
 */
export async function initializeDatabase() {
  console.log("Initializing database with sample data...");
  
  try {
    // Check if data already exists
    const existingCategories = await db.select().from(schema.categories);
    if (existingCategories.length > 0) {
      console.log("Database already contains data. Skipping initialization.");
      return;
    }
    
    // Categories
    const categories = [
      { name: "Oil & Fluids", description: "Engine oil, transmission fluid, brake fluid, etc.", icon: "fa-oil-can" },
      { name: "Batteries", description: "Car batteries and accessories", icon: "fa-car-battery" },
      { name: "Engine Parts", description: "Engine components and parts", icon: "fa-cogs" },
      { name: "Brakes", description: "Brake pads, rotors, calipers, etc.", icon: "fa-compress-arrows-alt" },
      { name: "Electrical", description: "Alternators, starters, and electrical components", icon: "fa-bolt" },
      { name: "Filters", description: "Air, oil, fuel, and cabin filters", icon: "fa-filter" }
    ];
    
    console.log("Creating categories...");
    for (const category of categories) {
      await db.insert(schema.categories).values(category);
    }
    
    // Vehicle Makes
    const makes = ["Toyota", "Honda", "Ford", "Chevrolet", "BMW"];
    
    console.log("Creating vehicle makes...");
    for (const make of makes) {
      await db.insert(schema.vehicleMakes).values({ name: make });
    }
    
    // Get Toyota ID
    const toyotaMake = await db.select().from(schema.vehicleMakes).where(schema.vehicleMakes.name == "Toyota");
    const toyotaId = toyotaMake[0].id;
    
    // Toyota Models
    const toyotaModels = [
      { makeId: toyotaId, name: "Camry", yearStart: 2010, yearEnd: 2023 },
      { makeId: toyotaId, name: "Corolla", yearStart: 2010, yearEnd: 2023 },
      { makeId: toyotaId, name: "RAV4", yearStart: 2010, yearEnd: 2023 },
      { makeId: toyotaId, name: "Highlander", yearStart: 2010, yearEnd: 2023 }
    ];
    
    console.log("Creating Toyota models...");
    for (const model of toyotaModels) {
      await db.insert(schema.vehicleModels).values(model);
    }
    
    // Get Camry ID
    const camryModel = await db.select().from(schema.vehicleModels).where(schema.vehicleModels.name == "Camry");
    const camryId = camry.id;
    
    // Engines for Camry
    const camryEngines = [
      { modelId: camryId, name: "2.5L 4-Cylinder", description: "2.5L 4-Cylinder engine for Toyota Camry" },
      { modelId: camryId, name: "3.5L V6", description: "3.5L V6 engine for Toyota Camry" }
    ];
    
    console.log("Creating Camry engines...");
    for (const engine of camryEngines) {
      await db.insert(schema.vehicleEngines).values(engine);
    }
    
    // Get the IDs for the models
    const allModels = await db.select().from(schema.vehicleModels);
    const modelMap = new Map(allModels.map(model => [model.name, model.id]));
    
    // Sample products
    const products = [
      {
        name: "Premium Oil Filter",
        description: "High-quality oil filter compatible with Toyota and Honda vehicles",
        price: 1299, // $12.99
        imageUrl: "https://images.unsplash.com/photo-1600861195091-690f0e132e98",
        categoryId: 6, // Filters
        inStock: 100,
        compatibleVehicles: [modelMap.get("Camry") || 0, modelMap.get("Corolla") || 0], // Camry, Corolla
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
        compatibleVehicles: [modelMap.get("Camry") || 0, modelMap.get("Corolla") || 0], // Camry, Corolla
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
        compatibleVehicles: Array.from(modelMap.values()), // All Toyota models
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
        compatibleVehicles: Array.from(modelMap.values()), // All Toyota models
        rating: 350, // 3.5 stars
        reviewCount: 42,
        isTopRated: false,
        isOnSale: false
      }
    ];
    
    console.log("Creating products...");
    for (const product of products) {
      await db.insert(schema.products).values(product);
    }
    
    // Get product IDs
    const allProducts = await db.select().from(schema.products);
    const productMap = new Map(allProducts.map(product => [product.name, product.id]));
    
    // Maintenance Items
    const maintenanceItems = [
      {
        name: "Oil Change",
        description: "Change engine oil and filter",
        intervalMiles: 5000,
        intervalMonths: 6,
        severeIntervalMiles: 3000,
        severeIntervalMonths: 3,
        relatedProductIds: [productMap.get("Premium Oil Filter") || 0], // Oil Filter
        applicableVehicles: Array.from(modelMap.values()) // All Toyota models
      },
      {
        name: "Tire Rotation",
        description: "Rotate tires to ensure even wear",
        intervalMiles: 5000,
        intervalMonths: 6,
        severeIntervalMiles: 3000,
        severeIntervalMonths: 3,
        relatedProductIds: [],
        applicableVehicles: Array.from(modelMap.values()) // All Toyota models
      },
      {
        name: "Air Filter Replacement",
        description: "Replace engine air filter",
        intervalMiles: 15000,
        intervalMonths: 12,
        severeIntervalMiles: 10000,
        severeIntervalMonths: 6,
        relatedProductIds: [productMap.get("Performance Air Filter") || 0], // Performance Air Filter
        applicableVehicles: Array.from(modelMap.values()) // All Toyota models
      },
      {
        name: "Cabin Filter Replacement",
        description: "Replace cabin air filter",
        intervalMiles: 15000,
        intervalMonths: 12,
        severeIntervalMiles: 10000,
        severeIntervalMonths: 6,
        relatedProductIds: [],
        applicableVehicles: Array.from(modelMap.values()) // All Toyota models
      },
      {
        name: "Brake Inspection",
        description: "Inspect brake pads, rotors, and calipers",
        intervalMiles: 10000,
        intervalMonths: 12,
        severeIntervalMiles: 5000,
        severeIntervalMonths: 6,
        relatedProductIds: [productMap.get("Ceramic Brake Pads") || 0], // Ceramic Brake Pads
        applicableVehicles: Array.from(modelMap.values()) // All Toyota models
      },
      {
        name: "Transmission Fluid Change",
        description: "Change automatic transmission fluid",
        intervalMiles: 30000,
        intervalMonths: 24,
        severeIntervalMiles: 15000,
        severeIntervalMonths: 12,
        relatedProductIds: [],
        applicableVehicles: Array.from(modelMap.values()) // All Toyota models
      },
      {
        name: "Spark Plugs Replacement",
        description: "Replace spark plugs",
        intervalMiles: 60000,
        intervalMonths: 60,
        severeIntervalMiles: 30000,
        severeIntervalMonths: 30,
        relatedProductIds: [],
        applicableVehicles: Array.from(modelMap.values()) // All Toyota models
      }
    ];
    
    console.log("Creating maintenance items...");
    for (const item of maintenanceItems) {
      await db.insert(schema.maintenanceItems).values(item);
    }
    
    console.log("Database initialization completed successfully.");
    
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}