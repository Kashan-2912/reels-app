const express = require('express');
const app = require('./src/app');
const connectDb = require('./src/db/db');

connectDb();

app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});