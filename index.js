require("dotenv").config();

const connectToMongo = require('./db');
const express = require('express')
const cors = require('cors');

connectToMongo();

const app = express()
const port = process.env.PORT

// Middleware to read JSON
app.use(express.json());
app.use(cors()); // Enables CORS for all origins and all routes

app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

app.listen(port, () => {
  console.log(`iNotebook backend listening on port ${port}`)
})
