const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = 5000;

const app = express();
app.use(cors());
app.use(express.json());

// Simple request logger to help debug missing-route 404s
app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.path);
  next();
});

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

    const database = client.db('pawmartList');
    const listCollection = database.collection('lists');
    const orderList = database.collection('oderList');
    const reviewsCollection = database.collection('reviews');
    const usersCollection = database.collection('users');

    // --- List APIs ---
    app.post('/addlist', async (req, res) => {
      const data = { ...req.body, createdAt: new Date() };
      await listCollection.insertOne(data);
      res.send({ message: "List added successfully", data });
    });

    app.get('/addlist', async (req, res) => {
      const lists = await listCollection.find().toArray();
      res.send(lists);
    });

    app.get('/addlist/:id', async (req, res) => {
      const list = await listCollection.findOne({ _id: new ObjectId(req.params.id) });
      res.send(list);
    });

    app.get('/myadded-lists', async (req, res) => {
      const { email } = req.query;
      const lists = await listCollection.find({ email }).toArray();
      res.send(lists);
    });

    app.put('/update/:id', async (req, res) => {
      const result = await listCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: req.body }
      );
      res.send(result);
    });

    app.delete('/list/:id', async (req, res) => {
      const result = await listCollection.deleteOne({ _id: new ObjectId(req.params.id) });
      res.send(result);
    });

    // --- Order APIs ---
    app.post('/addoder', async (req, res) => {
      const result = await orderList.insertOne(req.body);
      res.send({ message: "Order added successfully", data: req.body });
    });

    app.get('/myorder', async (req, res) => {
      const { email } = req.query;
      const orders = await orderList.find({ email }).toArray();
      res.send(orders);
    });

    // --- Community Reviews ---
    app.post('/community/review', async (req, res) => {
      console.log('Handler: POST /community/review', req.body);
      const review = { ...req.body, createdAt: new Date() };
      await reviewsCollection.insertOne(review);
      res.send({ message: "Review added successfully", data: review });
    });

    app.get('/community/reviews', async (req, res) => {
      console.log('Handler: GET /community/reviews', req.query);
      const { petOrProduct } = req.query;
      const filter = petOrProduct ? { petOrProduct } : {};
      const reviews = await reviewsCollection.find(filter).toArray();
      res.send(reviews);
    });

    console.log("Connected to MongoDB successfully!");

    // Root endpoint (registered after routes are ready)
    app.get('/', (req, res) => {
      res.send('Hello from server side of PawCat');
    });

    // Start server after routes are registered
    app.listen(port, () => {
      console.log(`Server is running on port: ${port}`);
    });
  } catch (err) {
    console.error('Error during startup:', err);

    // If DB connection failed, still expose root and start server so client can receive meaningful errors
    app.get('/', (req, res) => {
      res.send('Server started without DB connection - some APIs may be unavailable');
    });

    app.listen(port, () => {
      console.log(`Server is running on port: ${port} (without DB)`);
    });
  }
}

// Start backend
run().catch((e) => console.error('Run failed:', e));

