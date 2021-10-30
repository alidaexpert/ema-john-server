const express=require("express")
const cors=require("cors")
const {MongoClient}=require("mongodb")
require('dotenv').config()
const ObjectId=require("mongodb").ObjectId
const app=express()
const port=process.env.PORT || 5000
app.use(cors())
app.use(express.json())

app.get("/",(req,res)=>{
    res.send("hit the port and node")
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uwcfz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(process.env.DB_PASS,uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
      await client.connect();
      const emaJhon = client.db("ema_jhon");
      const productsColection = emaJhon.collection("products");
      // create a document to insert
    //   const doc = {
    //     title: "Record of a Shriveled Datum",
    //     content: "No bytes, no problem. Just insert a document, in MongoDB",
    //   }
    //   const result = await productsColection.insertOne(doc);
    //   console.log(`A document was inserted with the _id: ${result.insertedId}`);
    app.get("/products",async(req,res)=>{
        const count=await productsColection.find({}).count()
        const page=req.query.page
        const size=parseInt(req.query.size)
        let products;
        if(page){
            products=await productsColection.find({}).skip(page*size).limit(size).toArray()

        }
        else(
         products=await productsColection.find({}).toArray()

        )
        // console.log(products.length)
        res.json({
            count,
            products
        })
    })
    app.get("/products/:id",async(req,res)=>{
        const id=req.params.id
        const filter={_id:ObjectId(id)}
        const result=await productsColection.findOne(filter)
        res.json(result)
    })
    app.post("/products/bykeys",async(req,res)=>{
        const keys=req.body
        // console.log(keys)
        const item={key:{$in:keys}}
        // console.log(item)
        const result= await productsColection.find(item).toArray()
        // console.log(result)
        // // const result= await productsColection.insertOne(item)
        res.json(result)
    })
    app.put("/product/:id",async(req,res)=>{
        const id=req.params.id
        const filter={_id:ObjectId(id)}
        const item=req.body
        const option={upsert:true}
        const docs={
            $set:{
                name:item.name,
                price:item.price
            }
            
        }
        const result=await productsColection.updateOne(filter,docs,option)
        res.json(result)

    })
    app.delete("/products/:id",async(req,res)=>{
        const id=req.params.id
        const filter={_id:ObjectId(id)}
        const result=await productsColection.deleteOne(filter)
        res.json(result)
    })

    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);

app.listen(port,()=>{
    console.log("Running the localhost",port)
})