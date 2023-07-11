const express = require('express');
const cors = require('cors');
const {ObjectId, MongoClient} = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGODB_URI);

const app = express();
const db = client.db('nFactorial')
const todos = db.collection('todo-list');
app.use(express.json(), cors())

// Get all items
app.get("/items", async (req, res) => {
    const response = await todos.find({}).toArray();
    res.status(200).send(response)
})

// Add items
app.post("/items", async (req, res) => {
    const item = req.body;
    if(item.task) {
        const response = await todos.insertOne(item);
        item["_id"] = response.insertedId;
        res.status(200).send(item);
    }
})

// Change status
app.put("/items/:itemId", async (req, res) => {
    const itemId = req.params.itemId;
    const {status} = req.body;
    console.log("Item id: ", itemId)
    console.log("Status: ", status)
    if(status){
        const result = await todos.updateOne({_id: new ObjectId(itemId)}, {
            $set: {
                status
            }
        })
        res.status(200).send(`${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`)
    }
})

// Delete
app.delete("/items/:itemId", async(req, res)=>{
    const itemId = req.params.itemId;
    const result = await todos.deleteOne({_id: new ObjectId(itemId)})
    res.status(200).send("Item was successfully deleted!")
})

async function run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();
      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
}
run().catch(console.dir);

app.listen(8000, () => {
    console.log("Server is listening");
})