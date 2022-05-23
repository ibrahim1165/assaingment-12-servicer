const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000
app.use(cors())
app.use(express.json())
const { MongoClient, ServerApiVersion } = require('mongodb');





const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.82rz6.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
    try{
        await client.connect();
        const serviceCollection = client.db('garageTech').collection('service');

        app.get('/service',async(req,res)=>{
            const query ={};
            const curser =serviceCollection.find(query);
            const result = await curser.toArray()
            res.send(result);

            
        })

    }
    finally{

    }
}
run().catch(console.dir)
app.get('/', (req, res) => {
    res.send('Hello form Bike!')
})

app.listen(port, () => {
    console.log(`GARAge tech listening on port ${port}`)
})