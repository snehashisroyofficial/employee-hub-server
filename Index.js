const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_KEY}@cluster0.8kmx02i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const userCollection = client.db("EmployeeHub").collection("user");
    const worksheetCollection = client
      .db("EmployeeHub")
      .collection("worksheet");

    // post user to database
    app.post("/users", async (req, res) => {
      const data = req.body;
      const query = { email: data.email };
      const useExist = await userCollection.findOne(query);
      if (useExist) {
        console.log("user already exist");
        return res.send("user already exists in database");
      }
      const result = await userCollection.insertOne(data);
      res.send(result);
    });

    // get the all users
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    // patch user verify status
    app.patch("/users/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      console.log(body);
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          isVerified: body.isVerified,
        },
      };
      const result = await userCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // get all the users based on email
    app.get("/users/:email", async (req, res) => {
      const data = req.params.email;

      const email = { email: data };
      const result = await userCollection.findOne(email);
      res.send(result);
    });

    // work sheet
    app.post("/work-sheet", async (req, res) => {
      const query = req.body;
      const result = await worksheetCollection.insertOne(query);
      res.send(result);
    });

    // get all the work sheet data based on email
    app.get("/work-sheet/:email", async (req, res) => {
      const data = req.params.email;
      const query = { email: data };
      const result = await worksheetCollection.find(query).toArray();

      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.log);

app.get("/", (req, res) => {
  res.send("Employee Hub Server is running");
});

app.listen(port, () => {
  console.log(`Employee Hub running on ${port} `);
});
