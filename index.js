const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = 5000;


const app = express();
app.use(cors());
app.use(express.json());


const uri = process.env.MONGO_URL;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    await client.connect();

    // database collection 
    const database = client.db('pawmartList');
    const listCollection = database.collection('lists');
    const oderList = database.collection('oderList');

    // post or send data
    app.post('/addlist', async (req, res) => {
      const requestBody = req.body;
      //console.log(requestBody);
      const date = new Date();
      requestBody.createdAt = date;
      const result = await listCollection.insertOne(requestBody);
      res.send({ message: "Received successfully", data: requestBody });
    });

    app.post('/addoder', async (req, res) => {
      const requestBody = req.body;
      //console.log(requestBody);
      const result = await oderList.insertOne(requestBody);
      res.send({ message: "Received successfully", data: requestBody });
    });


    // get List data
    app.get('/addlist', async (req, res) => {
      const result = await listCollection.find().toArray();
      res.send(result);
    })

    app.get('/addlist/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await listCollection.findOne(query);
      res.send(result);
    })


    app.get('/myadded-lists', async (req, res) => {
      const { email } = req.query;

      const query = { email: email };
      const result = await listCollection.find(query).toArray();

      res.send(result);

    })

    app.put('/update/:id', async (req, res) => {
      const data = req.body;

      const id = req.params.id;
      const query = { _id: new ObjectId(id) }

      const updateList = {
        $set: data
      }

      const result = await listCollection.updateOne(query, updateList)

      res.send(result);

      console.log(data);

    })


    // DELETE A LIST ITEM
    app.delete('/list/:id', async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };

      const result = await listCollection.deleteOne(query);

      res.send(result);
    });



    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello from server side of PawCat');
})

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
})


