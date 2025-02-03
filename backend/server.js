const express = require("express");
const connectDatabase = require("./database");
const Vehicle = require("./vehicle");
const makeSuggestions = require("./business-logic")

const app = express();
const port = 3000;
app.use(express.json());

connectDatabase();

// GET: http://localhost:[port]/suggestions
// request vehicle suggestions for given trip parameters
app.get("/suggestions", async (req, res) => {
  try {
    // get query parameters
    const passengers = req.query.passengers;
    const distance = req.query.distance;

    // select all vehicles (excluding "__v" revision number field)
    const vehiclesQuery = await Vehicle.find({}, { __v: 0 });
    console.log(vehiclesQuery);
    res.json(makeSuggestions(vehiclesQuery, passengers, distance));
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// POST: http://localhost:[port]/vehicles/add
// add new vehicle to the fleet's database
app.post("/vehicles/add", async (req, res) => {
  try {
    const { capacity, range, fuel } = req.body;
    const vehicle = await Vehicle.create({ capacity, range, fuel });
    res.send(`New vehicle successfully added with ID=${vehicle.id}.`);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//GET: http://localhost:[port]/
// check whether the server is responsive
app.get("/", (req, res) => {
  res.json("Success.");
});

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
