const express = require('express');
const app = express();
require('dotenv').config()
var cors = require('cors')
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uxesqqj.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});



async function sendEmail(data, email) {
    // This is your API key that you retrieve from www.mailgun.com/cp (free up to 10K monthly emails)
    const auth = {
        auth: {
            api_key: process.env.EMAIL_SEND_KEY,
            domain: process.env.EMAIL_SEND_DOMAIN
        }
    }

    const transporter = nodemailer.createTransport(mg(auth));

    transporter.sendMail({
        from: email,
        to: process.env.EMAIL_RECEIVER,
        subject: `Stock message`,

        text: `${data.date}  date of the price of sugar is ${data.value} dollars`

    }, (err, info) => {
        if (err) {
            console.log(`Error: ${err}`);
        }
        else {
            console.log(`Response: ${info}`);
        }
    });
}

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const stockDetails = client.db("SugarStock").collection("stockDetails");

        app.get('/stockDetails', async (req, res) => {
            const query = {};
            const data = stockDetails.find(query);
            const result = await data.toArray();
            res.send(result);
        })

        app.post('/stock', async (req, res) => {
            const doc = req.body;
            console.log(doc);
            const result = await stockDetails.insertOne(doc);
            res.send(result);
        })

        app.post('/sendEmail/:email', async (req, res) => {
            const email = req.params.email;
            console.log(email);
            const doc = req.body;
            console.log(doc);
            res.send({ result: 'Success' });
            await sendEmail(doc, email);
        })
    }
    finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('BISMILLAH')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})