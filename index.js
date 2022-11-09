const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

require("dotenv").config();

const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@mamunlm10.47xczn4.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const packagesCollection = client
      .db("smile-photography")
      .collection("packages");

    const reviewCollection = client
      .db("smile-photography")
      .collection("reviews");

    app.get("/services-limit", async (req, res) => {
      const query = {};
      const cursor = packagesCollection.find(query);
      const packages = await cursor.limit(3).toArray();
      res.send(packages);
    });
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = packagesCollection.find(query);
      const packages = await cursor.toArray();
      res.send(packages);
    });
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await packagesCollection.findOne(query);
      res.send(service);
    });

    //reviews

    app.get("/reviews", async (req, res) => {
      let query = {};
      if (req.query.packageName) {
        query = {
          packageName: req.query.packageName,
        };
      }

      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });
    app.get("/review", async (req, res) => {
      let query = {};
      console.log(query);
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });
  } finally {
  }
}
run().catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("Assignment 11 server is running");
});

app.listen(port, () => {
  console.log(`Assignment 11 server is running in the port: ${port}`);
});
