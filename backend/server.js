const express = require("express");
const connectDatabase = require("./database");
const Vehicle = require("./vehicle");

const app = express();
const port = 3000;
app.use(express.json());

connectDatabase();

// whether the vehicle is able to transport the amount of people to the given distance
function isVehicleEligible(vehicle, passengers, distance) {
  console.log("boop");
  if (vehicle.capacity < passengers) return false;
  console.log(vehicle);
  // hybrid vehicles can get twice as far during urban trips (<50km) due to electric mode
  const requiredRange = (vehicle.fuel === "mild hybrid" && distance < 50) ? distance / 2 : distance;
  return !(vehicle.range < requiredRange);
}

// business logic to calculate potential profit per vehicle
function calculateProfit(vehicle, passengers, distance) {
  let profit = 0;
  let tripIsUrban = (distance < 50);

  // travel time in minutes (doubled for urban)
  let travelTime = distance
  if (tripIsUrban) travelTime *= 2;

  // taxi fare: 2 euro per kilometer
  profit += distance * 2;

  // taxi fare: 2 euro per half hour started
  profit += Math.ceil(travelTime / 30) * 2;

  // each passenger pays the fare
  profit *= passengers;

  // fuel cost (hybrid cars use electric mode during urban trips)
  if (vehicle.fuel === "pure electric") {
    profit -= distance;
  }
  else if (vehicle.fuel === "mild hybrid" && tripIsUrban) {
    profit -= distance;
  }
  else {
    profit -= distance * 2;
  }

  return profit;
}

// return assumed profit of each eligible vehicle, calculated using the trip's parameters
function makeSuggestions(query, passengers, distance) {
  let vehicleCombinations = [];

  query.forEach((vehicle) => {
    if (isVehicleEligible(vehicle, passengers, distance)) {
      // convert Mongoose doc to POJO
      let combination = vehicle.toObject();
      combination["assumedProfit"] = calculateProfit(vehicle, passengers, distance);
      vehicleCombinations.push(combination);
    }
  });

  return vehicleCombinations;
}

// GET: http://localhost:[port]/suggestions
// request vehicle suggestions for given trip parameters
app.get("/suggestions", async (req, res) => {
  try {
    // get query parameters
    const passengers = req.query.passengers
    const distance = req.query.distance

    // select all vehicles (excluding "__v" revision number field)
    const vehiclesQuery = await Vehicle.find({}, { __v: 0 });
    console.log(vehiclesQuery);
    res.json(makeSuggestions(vehiclesQuery, passengers, distance));
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// POST: http://localhost:[port]/vehicles
// add new vehicle to the fleet's database
app.post("/vehicles", async (req, res) => {
  try {
    const { capacity, range, fuel } = req.body;
    await Vehicle.create({ capacity, range, fuel });
    res.send("New vehicle successfully added."); // TODO: return ID
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/", (req, res) => { // TODO: remove
  res.send("Hello World!");
});

app.post("/", (req, res) => { // TODO: remove
  res.send("Got a POST request");
});

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
