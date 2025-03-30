import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';
import { eq } from 'drizzle-orm';

// Fonction d'initialisation de la base de données PostgreSQL
export async function initializePostgresDatabase() {
  console.log("Initializing PostgreSQL database with sample data...");
  
  // Vérifie si l'URL de la base de données est définie
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not defined.");
    return;
  }
  
  // Crée une connexion PostgreSQL
  const client = postgres(process.env.DATABASE_URL);
  const db = drizzle(client, { schema });
  
  try {
    // Vérifie si des données existent déjà
    const categories = await db.select().from(schema.categories);
    if (categories.length > 0) {
      console.log("Database already contains data. Skipping initialization.");
      await client.end();
      return;
    }
    
    // Catégories
    const categoryData = [
      { name: "Oil & Fluids", description: "Engine oil, transmission fluid, brake fluid, etc.", icon: "fa-oil-can" },
      { name: "Batteries", description: "Car batteries and accessories", icon: "fa-car-battery" },
      { name: "Engine Parts", description: "Engine components and parts", icon: "fa-cogs" },
      { name: "Brakes", description: "Brake pads, rotors, calipers, etc.", icon: "fa-compress-arrows-alt" },
      { name: "Electrical", description: "Alternators, starters, and electrical components", icon: "fa-bolt" },
      { name: "Filters", description: "Air, oil, fuel, and cabin filters", icon: "fa-filter" }
    ];
    
    console.log("Creating categories...");
    for (const category of categoryData) {
      await db.insert(schema.categories).values(category);
    }
    
    // Marques de véhicules
    const makeData = ["Toyota", "Honda", "Ford", "Chevrolet", "BMW"];
    
    console.log("Creating vehicle makes...");
    for (const makeName of makeData) {
      await db.insert(schema.vehicleMakes).values({ name: makeName });
    }
    
    // Obtenir l'ID Toyota
    const toyotaMakes = await db.select().from(schema.vehicleMakes)
      .where(eq(schema.vehicleMakes.name, "Toyota"));
    
    if (toyotaMakes.length === 0) {
      throw new Error("Toyota make not found");
    }
    
    const toyotaId = toyotaMakes[0].id;
    
    // Modèles Toyota
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
    
    // Obtenir l'ID Camry
    const camryModels = await db.select().from(schema.vehicleModels)
      .where(eq(schema.vehicleModels.name, "Camry"));
    
    if (camryModels.length === 0) {
      throw new Error("Camry model not found");
    }
    
    const camryId = camryModels[0].id;
    
    // Moteurs pour Camry
    const camryEngines = [
      { modelId: camryId, name: "2.5L 4-Cylinder", description: "2.5L 4-Cylinder engine for Toyota Camry" },
      { modelId: camryId, name: "3.5L V6", description: "3.5L V6 engine for Toyota Camry" }
    ];
    
    console.log("Creating Camry engines...");
    for (const engine of camryEngines) {
      await db.insert(schema.vehicleEngines).values(engine);
    }
    
    // Obtenir les IDs des modèles
    const allModels = await db.select().from(schema.vehicleModels);
    const modelIds = allModels.map(model => model.id);
    
    // Produits
    const filterCategoryId = 6;  // ID de la catégorie "Filters"
    const brakesCategoryId = 4;  // ID de la catégorie "Brakes"
    const electricalCategoryId = 5;  // ID de la catégorie "Electrical"
    
    const productData = [
      {
        name: "Premium Oil Filter",
        description: "High-quality oil filter compatible with Toyota and Honda vehicles",
        price: 1299,
        imageUrl: "https://images.unsplash.com/photo-1600861195091-690f0e132e98",
        categoryId: filterCategoryId,
        inStock: 100,
        compatibleVehicles: [modelIds[0], modelIds[1]],  // Camry, Corolla
        rating: 450,
        reviewCount: 128,
        isTopRated: true,
        isOnSale: false,
        salePrice: null
      },
      {
        name: "Ceramic Brake Pads",
        description: "High-performance ceramic brake pads for Toyota Camry and Corolla",
        price: 4999,
        imageUrl: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023",
        categoryId: brakesCategoryId,
        inStock: 50,
        compatibleVehicles: [modelIds[0], modelIds[1]],  // Camry, Corolla
        rating: 500,
        reviewCount: 94,
        isTopRated: false,
        isOnSale: true,
        salePrice: 3999
      },
      {
        name: "Performance Air Filter",
        description: "Universal fit performance air filter for improved airflow",
        price: 2499,
        imageUrl: "https://images.unsplash.com/photo-1614026480209-cd9934144671",
        categoryId: filterCategoryId,
        inStock: 75,
        compatibleVehicles: modelIds,  // All Toyota models
        rating: 400,
        reviewCount: 67,
        isTopRated: false,
        isOnSale: false,
        salePrice: null
      },
      {
        name: "Premium Wiper Blades",
        description: "22-inch all-weather wiper blades for clear visibility",
        price: 1899,
        imageUrl: "https://images.unsplash.com/photo-1596113199003-03babc2bdd2b",
        categoryId: electricalCategoryId,
        inStock: 120,
        compatibleVehicles: modelIds,  // All Toyota models
        rating: 350,
        reviewCount: 42,
        isTopRated: false,
        isOnSale: false,
        salePrice: null
      }
    ];
    
    console.log("Creating products...");
    for (const product of productData) {
      await db.insert(schema.products).values(product);
    }
    
    // Obtenir les IDs des produits
    const allProducts = await db.select().from(schema.products);
    const productMap = new Map();
    allProducts.forEach(product => {
      productMap.set(product.name, product.id);
    });
    
    // Éléments de maintenance
    const maintenanceData = [
      {
        name: "Oil Change",
        description: "Change engine oil and filter",
        intervalMiles: 5000,
        intervalMonths: 6,
        severeIntervalMiles: 3000,
        severeIntervalMonths: 3,
        relatedProductIds: [productMap.get("Premium Oil Filter")],
        applicableVehicles: modelIds
      },
      {
        name: "Tire Rotation",
        description: "Rotate tires to ensure even wear",
        intervalMiles: 5000,
        intervalMonths: 6,
        severeIntervalMiles: 3000,
        severeIntervalMonths: 3,
        relatedProductIds: [],
        applicableVehicles: modelIds
      },
      {
        name: "Air Filter Replacement",
        description: "Replace engine air filter",
        intervalMiles: 15000,
        intervalMonths: 12,
        severeIntervalMiles: 10000,
        severeIntervalMonths: 6,
        relatedProductIds: [productMap.get("Performance Air Filter")],
        applicableVehicles: modelIds
      },
      {
        name: "Brake Inspection",
        description: "Inspect brake pads, rotors, and calipers",
        intervalMiles: 10000,
        intervalMonths: 12,
        severeIntervalMiles: 5000,
        severeIntervalMonths: 6,
        relatedProductIds: [productMap.get("Ceramic Brake Pads")],
        applicableVehicles: modelIds
      }
    ];
    
    console.log("Creating maintenance items...");
    for (const item of maintenanceData) {
      await db.insert(schema.maintenanceItems).values(item);
    }
    
    console.log("Database initialization completed successfully.");
  } catch (error) {
    console.error("Error initializing database:", error);
  } finally {
    // Ferme la connexion
    await client.end();
  }
}