import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { sign } from 'hono/jwt';
import UserRoutes from '../routes/userRoute';
import BlogRoutes from '../routes/BlogRoute';

const app=new Hono();

app.route('/api/v1/user',UserRoutes);
app.route('/api/v1/blog',BlogRoutes);



export default app
