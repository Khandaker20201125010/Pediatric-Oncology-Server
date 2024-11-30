const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.texsw4y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;



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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const patientCollection = client.db("PediatricOncology").collection("Patients");
    const usersCollection = client.db("PediatricOncology").collection("users");
    //users
    app.get('/users',async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result)
    })
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email
      const query = { email: email }
      const result = await usersCollection.findOne(query)
      res.send(result)
    })
    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existsUser = await usersCollection.findOne(query);
      if (existsUser) {
        return res.send({ message: 'user already exist', insertedId: null })
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    })
    // Get methods
    app.get('/allPatients', async (req, res) => {
      const cursor = patientCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/allPatients/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await patientCollection.findOne(query);
      res.send(result);
    })
    app.get('/allPatients/:email', async (req, res) => {
      const email = req.params.email
      const query = { email: email }
      const result = await patientCollection.findOne(query)
      res.send(result)
    })

    // Post methods
    app.post('/allPatients', async (req, res) => {
      const patient = req.body;
      const result = await patientCollection.insertOne(patient);
      res.send(result);
    })
    app.delete('/allPatients/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await patientCollection.deleteOne(query);
      res.send(result);
    })


    // Update methods
    app.put('/allPatients/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const patient = req.body;
      const options = { upsert: true };
      const updateDoc = {
        $set: patient
      };
      const result = await patientCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    })
    app.put('/allPatients/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const patient = req.body;
      const options = { upsert: true };
      const updateDoc = {
        $set: patient
      };
      const result = await patientCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    app.patch('/allPatients/:id', async (req, res) => {
      const { id } = req.params;
      const { medicineIndex, scheduleIndex, taken } = req.body;

      try {
        // Find the patient by ID
        const patient = await Patient.findById(id);
        if (!patient) {
          return res.status(404).json({ success: false, message: 'Patient not found.' });
        }

        // Check if the specified medicine and schedule indexes are valid
        const medicine = patient.medicines[medicineIndex];
        if (medicine && medicine.schedule[scheduleIndex]) {
          // Update the taken status for the schedule item
          medicine.schedule[scheduleIndex].taken = taken;
          await patient.save(); // Save the updated patient data
          return res.json({ success: true });
        }

        return res.status(400).json({ success: false, message: 'Invalid medicine or schedule index.' });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
      }
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Pediatric Oncology activated');
});

app.listen(port, () => {
  console.log(`Pediatric Oncology is running on port ${port}`)
})