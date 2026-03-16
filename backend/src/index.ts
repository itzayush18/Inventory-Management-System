import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';
import { authRoutes } from './routes/auth';
import { inventoryRoutes } from './routes/inventory';
type Variables = {
  jwtPayload: {
    id: number;
    username: string;
    role: string;
  };
};

const app = new Hono<{ Variables: Variables }>();

app.use('*', logger());
app.use('*', cors());

// Default route
app.get('/', (c) => c.text('Inventory Management System API'));

// Auth routes
app.route('/api/auth', authRoutes);

// Protected routes
app.use('/api/*', jwt({
  secret: process.env.JWT_SECRET || 'supersecretkey',
  alg: 'HS256',
}));

app.route('/api', inventoryRoutes);

export default {
  port: process.env.PORT || 3001,
  fetch: app.fetch,
};
