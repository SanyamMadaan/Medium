import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { sign,verify } from 'hono/jwt';

const BlogRoutes = new Hono<{
  Bindings:{
    DATABASE_URL:string
  },
  Variables:{
    userId:string
  }
}>()

BlogRoutes.use('/*',async(c,next)=>{
    try{
        const token=c.req.header('authorization') || "";
        const isVerified=await verify(token,'12345')
        if(isVerified){
            const userId=isVerified.id;
            //@ts-ignore
            c.set('userId',userId);
            await next();
        }
        else{
            c.status(403);
            c.json({msg:'unothorized access'})
        }
    }catch(e){
        c.status(403);
        c.json({msg:'unothorized access'})
    }
})

BlogRoutes.post('/',async(c)=>{
    
    const userID=c.get('userId');

    const prisma=new PrismaClient({
        datasourceUrl:c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const body=await c.req.json();
    const post=await prisma.post.create({
        data:{
            title:body.title,
            content:body.content,
            authorId:userID
        }
    })
    return c.json({id:post.id});
  })
  
BlogRoutes.put('/editblog',async(c)=>{
    const userId=c.get('userId');

    const prisma=new PrismaClient({
        datasourceUrl:c.env.DATABASE_URL
    }).$extends(withAccelerate())

    const body=await c.req.json();
    const updatedblog=await prisma.post.update({
        where:{
            id:body.id,
            authorId:userId
        },
        data:{
            title:body.title,
            content:body.content
        }
    })
    return c.text('Post updated successfully');
  })
  
BlogRoutes.get('/findblog/:id', async(c) => {

    const primsa=new PrismaClient({
        datasourceUrl:c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const blogid=c.req.param('id');

    const Particularblog=await primsa.post.findUnique({
        where:{
            id:blogid
        }
    })
    return c.json(Particularblog)
  })
  
BlogRoutes.get('/allblog/bulk', async(c) => {

    const prisma=new PrismaClient({
        datasourceUrl:c.env.DATABASE_URL
    }).$extends(withAccelerate());

    const AllBlogs=await prisma.post.findMany({});

    c.status(200)
    return c.json(AllBlogs)
  })

  
export default BlogRoutes;