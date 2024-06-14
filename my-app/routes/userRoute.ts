import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { sign } from 'hono/jwt';

const UserRoutes = new Hono<{
  Bindings:{
    DATABASE_URL:string
  }
}>()


UserRoutes.post('/signup',async (c)=>{

  const prisma=new PrismaClient({
    datasourceUrl:c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const body=await c.req.json();

  try{
    const res=await prisma.user.create({
      data:{
        email:body.email,
        name:body.name,
        password:body.password
      }
      
    })
    const token=await sign({id:res.id},'12345');
    c.status(200);
    return c.json({token});
  }catch(e){
    c.status(500);
    return c.json({e});
  }
})

UserRoutes.post('/signin',async(c)=>{

  const prisma=new PrismaClient({
    datasourceUrl:c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body=await c.req.json();

  try{
    const res=await prisma.user.findFirst({
      where:{
        email:body.email,
        password:body.password
      }
    })
    if(res){
      const token=await sign({id:res.id},'12345')
      c.status(200);
      return c.text('user found successfully'+token);

    }
    else{
    c.status(403);
    return c.json({msg:'unauthorized access'})
    }
  }catch(e){
    c.status(403);
    c.json({msg:'unauthorized access'})
  }
})

export default UserRoutes;