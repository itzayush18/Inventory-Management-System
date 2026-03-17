import { Hono } from 'hono';
import { ReportsService } from '../services/reports.service';

const reportsRoutes = new Hono();

reportsRoutes.get('/dashboard', async (c) => {
  try {
    const stats = await ReportsService.getDashboardStats();
    return c.json(stats);
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to fetch dashboard stats' }, 500);
  }
});

reportsRoutes.get('/critical-stock', async (c) => {
  try {
    const stock = await ReportsService.getCriticalStock();
    return c.json(stock);
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to fetch critical stock' }, 500);
  }
});

reportsRoutes.get('/premium-products', async (c) => {
  try {
    const products = await ReportsService.getPremiumProducts();
    return c.json(products);
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to fetch premium products' }, 500);
  }
});

reportsRoutes.get('/comprehensive-view', async (c) => {
  try {
    const products = await ReportsService.getComprehensiveProducts();
    return c.json(products);
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to fetch comprehensive view' }, 500);
  }
});

reportsRoutes.post('/process-stock', async (c) => {
  try {
    const alerts = await ReportsService.runLowStockProcedure();
    return c.json({ message: 'Procedure executed successfully', alerts });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to run procedure' }, 500);
  }
});

export { reportsRoutes };
