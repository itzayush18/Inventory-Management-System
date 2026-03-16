import { Hono } from 'hono';
import { InventoryService } from '../services/inventory.service';
import { TransactionService } from '../services/transaction.service';

type Variables = {
  jwtPayload: {
    id: number;
    username: string;
    role: string;
  };
};

export const inventoryRoutes = new Hono<{ Variables: Variables }>();

// Products
inventoryRoutes.get('/products', async (c) => {
  const products = await InventoryService.getAllProducts();
  return c.json(products);
});

inventoryRoutes.post('/products', async (c) => {
  const body = await c.req.json();
  const insertId = await InventoryService.createProduct(body);
  return c.json({ id: insertId, ...body }, 201);
});

inventoryRoutes.patch('/products/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  await InventoryService.updateProduct(id, body);
  return c.json({ message: 'Product updated' });
});

// Categories
inventoryRoutes.get('/categories', async (c) => {
  const categories = await InventoryService.getAllCategories();
  return c.json(categories);
});

inventoryRoutes.post('/categories', async (c) => {
  const { name, description } = await c.req.json();
  const insertId = await InventoryService.createCategory(name, description);
  return c.json({ id: insertId, name, description }, 201);
});

// Suppliers
inventoryRoutes.get('/suppliers', async (c) => {
  const suppliers = await InventoryService.getAllSuppliers();
  return c.json(suppliers);
});

inventoryRoutes.post('/suppliers', async (c) => {
  const body = await c.req.json();
  const insertId = await InventoryService.createSupplier(body);
  return c.json({ id: insertId, ...body }, 201);
});

// Stock Transactions
inventoryRoutes.post('/stock-transactions', async (c) => {
  try {
    const { productId, type, quantity, reason } = await c.req.json();
    const user = c.get('jwtPayload');
    await TransactionService.recordStockTransaction(productId, user.id, type, quantity, reason);
    return c.json({ message: 'Stock updated successfully' });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to update stock' }, 500);
  }
});

// Recent Activities
inventoryRoutes.get('/recent-activities', async (c) => {
  const activities = await TransactionService.getTransactions(5);
  return c.json(activities);
});

// All Transactions
inventoryRoutes.get('/transactions', async (c) => {
  const transactions = await TransactionService.getTransactions();
  return c.json(transactions);
});

// Dashboard Stats
inventoryRoutes.get('/dashboard-stats', async (c) => {
  try {
    const stats = await TransactionService.getDashboardStats();
    return c.json(stats);
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to fetch dashboard stats' }, 500);
  }
});
