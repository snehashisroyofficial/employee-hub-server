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
    const salaysheetCollection = client
      .db("EmployeeHub")
      .collection("salarysheet");

    // post user to database
    app.post("/users", async (req, res) => {
      const data = req.body;
      const query = { email: data.email };
      const useExist = await userCollection.findOne(query);
      if (useExist) {
        return res.send("user already exists in database");
      }
      const result = await userCollection.insertOne(data);
      res.send(result);
    });

    // -------------------- EMPLOYEE API ------------------
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

    app.get("/payment-history/:email", async (req, res) => {
      const userEmail = req.params.email;
      const query = { email: userEmail };
      const result = await salaysheetCollection.find(query).toArray();
      res.send(result);
    });

    // ---------------- HR API ---------------------

    app.get("/work-sheet", async (req, res) => {
      const result = await worksheetCollection.find().toArray();
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.get("/users/:email", async (req, res) => {
      const data = req.params.email;

      const email = { email: data };
      const result = await userCollection.findOne(email);
      res.send(result);
    });

    app.post("/salary-sheet", async (req, res) => {
      const query = req.body;

      const result = await salaysheetCollection.insertOne(query);
      res.send(result);
    });

    app.get("/salary-sheet/:id", async (req, res) => {
      const id = req.params.id;
      const query = { userId: id };
      const result = await salaysheetCollection.find(query).toArray();
      res.send(result);
    });

    app.patch("/users/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          isVerified: body.isVerified,
        },
      };
      const result = await userCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // ---------------------- ADMIN API ---------------

    app.get("/verified-employee", async (req, res) => {
      const query = { isVerified: "true" };
      const result = await userCollection.find(query).toArray();
      res.send(result);
    });

    app.patch("/update-hr/:email", async (req, res) => {
      const user = req.params.email;
      const query = { email: user };
      const updateDoc = {
        $set: {
          role: "hr",
        },
      };

      const result = await userCollection.updateOne(query, updateDoc);
      res.send(result);
    });
    app.patch("/update-fired/:email", async (req, res) => {
      const user = req.params.email;
      const query = { email: user };
      const updateDoc = {
        $set: {
          accountStatus: "false",
        },
      };

      const result = await userCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    //delete all data

    // app.delete("/delete-all", async (req, res) => {
    //   const result = await worksheetCollection.deleteMany();
    //   const result2 = await salaysheetCollection.deleteMany();
    //   res.send(" Data deleted Success");
    // });

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
