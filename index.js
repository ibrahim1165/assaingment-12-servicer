const express = require('express')

const app = express()

const cors = require('cors');

require('dotenv').config();

const jwt = require('jsonwebtoken');

const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'unauthorized access' })
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {

    if (err) {
      return res.status(403).send({ message: 'Forbidden access' })
    }
    console.log('decoded', decoded)
    req.decoded = decoded;
    next()
  })
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.82rz6.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
  try {
    await client.connect();
    const serviceCollection = client.db('garageTech').collection('service');
    const orderCollection = client.db('garageTech').collection('order');
    const userCollection = client.db('garageTech').collection('user');
    const reviewCollection = client.db('reviews').collection('review');


    
    const verifyAdmin = async(req, res, next)=>{
      const requester = req.decoded.email;
      const requesterAccount = await userCollection.findOne({ email: requester });
      if (requesterAccount.role === 'admin') {
        next();
      }
      else {
        res.status(403).send({ message: 'forbidden' });
      }
    }


    app.get('/service', async (req, res) => {
      const query = {};
      const curser = serviceCollection.find(query);
      const result = await curser.toArray()
      res.send(result);
    })
    app.get('/review', async (req, res) => {
      const query = {};
      const curser = reviewCollection.find(query);
      const result = await curser.toArray()
      res.send(result);
    })
    
    app.post('/review',async (req, res) => {
      const order = req.body;
      const result = await reviewCollection.insertOne(order);
      res.send(result);
    });


   app.post('/service',async(req,res)=>{
     const newPost = req.body;
     const result = await serviceCollection.insertOne(newPost);
     res.send(result);
   })


    app.get('/service/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const result = await serviceCollection.findOne(query);
      res.send(result)
    })


    app.get('/user', verifyJWT, async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    })


    app.delete('/service/:id',async(req,res)=>{
      const id =req.params.id;
      const query = {_id:ObjectId(id)};
      const result = await serviceCollection.deleteOne(query);
      res.send(result);
  })


    app.put('/user/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '3d' })
      res.send({ result, token });
    });


    
    app.get('/admin/:email', async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      const isAdmin = user.role === 'admin';
      res.send({ admin: isAdmin })
    })

    app.put('/user/admin/:email', verifyJWT, verifyAdmin, async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const updateDoc = {
        $set: { role: 'admin' },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    })



    app.post('/order',async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });

    app.put("/service/:id", async (req, res) => {
      const id = req.params.id;
      const updatedQuantity = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc ={
        $set: {
          quantity: updatedQuantity.availablequantity,
        },
      };
      const result = await serviceCollection.updateOne(
        filter,
        updatedDoc,
        options
      );

      res.send(result);
    });

    app.get('/order', async (req, res) => {
      const query = {};
      const curser = orderCollection.find(query);
      const orders = await curser.toArray()
      res.send(orders);
    })

   app.get('/order', async(req, res) => {
    const decodedEmail = req.decoded.email;
    const email = req.query.email;
    if(email === decodedEmail){
        const query = { email: email };
        const curser =orderCollection.find(query)
        const orders = await curser.toArray()
         res.send(orders);
      }else{
        return res.status(403).send({ message: 'forbidden access' });
      }
   })



   app.delete('/order/:id', async(req,res)=>{
    const id =req.params.id;
    const query = {_id:ObjectId(id)};
    const result = await serviceCollection.deleteOne(query);
    res.send(result);
})


    app.get('/order', async (req, res) => {

    })


  }
  finally {

  }
}
run().catch(console.dir)
app.get('/', (req, res) => {
  res.send('Hello form Bike!')
})

app.listen(port, () => {
  console.log(`GARAge tech listening on port ${port}`)
})