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
