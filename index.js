const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
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

// verify jwt
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      res.status(401).send({ message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    const packagesCollection = client
      .db("smile-photography")
      .collection("packages");

    const reviewCollection = client
      .db("smile-photography")
      .collection("reviews");

    // jwt
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ token });
    });

    // service
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

    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await packagesCollection.insertOne(service);
      res.send(result);
    });

    //reviews
    app.get("/reviews", async (req, res) => {
      let query = {};
      if (req.query.packageName) {
        query = {
          packageName: req.query.packageName,
        };
      }
      const options = {
        sort: { date: -1 },
      };
      const cursor = reviewCollection.find(query, options);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });
    //get my review
    app.get("/my-review", verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      console.log(decoded);
      if (decoded.email !== req.query.email) {
        res.status(403).send({ message: "unauthorized access" });
      }

      let query = {};
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

    app.get("/my-review/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const user = await reviewCollection.findOne(query);
      res.send(user);
    });

    app.put("/my-review/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const review = req.body;
      const option = { upsert: true };
      const updatedReviewMessage = {
        $set: {
          reviewMessage: review.reviewMessage,
        },
      };
      const result = await reviewCollection.updateOne(
        filter,
        updatedReviewMessage,
        option
      );
      res.send(result);
    });

    app.delete("/my-review/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
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
