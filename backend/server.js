const express = require('express');

// make models, controllers, routes, etc.

const app = express();

app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});