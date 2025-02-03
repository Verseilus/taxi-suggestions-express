const express = require("express");
const connectDatabase = require("./database");
const Vehicle = require("./vehicle");
const makeSuggestions = require("./business-logic");

const app = express();
const port = 3000;
app.use(express.json());

connectDatabase();

// GET: http://localhost:[port]/suggestions
// request vehicle suggestions for given trip parameters
app.get("/suggestions", async (req, res) => {
  try {
    // get query parameters
    const passengers = Number(req.query.passengers);
    const distance = Number(req.query.distance);

    // validate passengers, must be integer>=1
    if (!Number.isInteger(passengers) || passengers < 1) {
      return res
        .status(400)
        .json({ error: "Passengers must be an integer, minimum 1." });
    }

    // validate distance, must be a number>=1
    if (Number.isNaN(distance) || distance < 1) {
      return res
        .status(400)
        .json({ error: "Distance must be a positive number, minimum 1." });
    }

    // select all vehicles (excluding "__v" revision number field)
    const vehiclesQuery = await Vehicle.find({}, { __v: 0 });
    console.log(vehiclesQuery);
    res.json(makeSuggestions(vehiclesQuery, passengers, distance));
  } catch (error) {
    res.status(400).send(error.message);
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
    res.status(400).send(error.message);
  }
});

//GET: http://localhost:[port]/healthcheck
// check whether the server is responsive
app.get("/healthcheck", (req, res) => {
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
