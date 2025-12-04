const { MongoClient, ServerApiVersion } = require('mongodb');
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
  // const database = client.db('pawmartList');
  // const listCollection = database.collection('lists');

    app.post('/addlist', async (req, res) => {
      const requestBody = req.body;
      console.log(requestBody);

      res.send({ message: "Received successfully", data: requestBody });
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


