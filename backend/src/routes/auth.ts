import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import bcrypt from 'bcryptjs';
import { AuthService } from '../services/auth.service';

type Variables = {
  jwtPayload: {
    id: number;
    username: string;
    role: string;
  };
};

export const authRoutes = new Hono<{ Variables: Variables }>();

authRoutes.post('/register', async (c) => {
  try {
    const { username, password } = await c.req.json();
    
    if (!username || !password) {
      return c.json({ error: 'Username and password are required' }, 400);
    }

    const userId = await AuthService.register(username, password);
    return c.json({ message: 'User registered successfully', id: userId }, 201);
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return c.json({ error: 'Username already exists' }, 400);
    }
    console.error(error);
    return c.json({ error: 'Failed to register user' }, 500);
  }
});

authRoutes.post('/login', async (c) => {
  try {
    const { username, password } = await c.req.json();
    const user = await AuthService.findUserByUsername(username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return c.json({ error: 'Invalid username or password' }, 401);
    }

    const token = await sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'supersecretkey'
    );

    return c.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Login failed' }, 500);
  }
});
