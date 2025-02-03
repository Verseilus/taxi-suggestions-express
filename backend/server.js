const express = require("express");
const connectDatabase = require("./database");
const Vehicle = require("./vehicle");

const app = express();
const port = 3000;
app.use(express.json());

connectDatabase();

// calculate length of urban section of trip
function calculateUrbanDistance(distance) {
  // a maximum of 50 kilometres is counter as urban
  const urbanDifference = 50 - distance;
  return urbanDifference < 0 ? 50 : distance;
}

// whether the vehicle is able to transport the amount of people to the given distance
function isVehicleEligible(vehicle, passengers, distance) {
  if (vehicle.capacity < passengers) return false;

  const urbanDistance = calculateUrbanDistance(distance);
  const countryDistance = distance - urbanDistance;
  // hybrid vehicles can get twice as far during urban sections (<50km) due to electric mode
  const requiredRange =
    vehicle.fuel === "mild hybrid"
      ? (countryDistance + urbanDistance * 0.5) / 2
      : distance;

  return !(vehicle.range < requiredRange);
}

// business logic to calculate potential profit per vehicle
function calculateProfit(vehicle, passengers, distance) {
  let profit = 0;
  const urbanDistance = calculateUrbanDistance(distance);
  const countryDistance = distance - urbanDistance;

  // travel time in minutes (doubled for urban)
  let travelTime = countryDistance + urbanDistance * 2;

  // taxi fare: 2 euro per kilometer
  profit += distance * 2;

  // taxi fare: 2 euro per half hour started
  profit += Math.ceil(travelTime / 30) * 2;

  // each passenger pays the fare
  profit *= passengers;

  // refueling cost (doubled for gasoline)
  if (vehicle.fuel === "pure electric") {
    profit -= distance;
  }
  // hybrid cars use electric mode during urban sections and gasoline otherwise
  else if (vehicle.fuel === "mild hybrid") {
    profit -= urbanDistance + countryDistance * 2;
  } else {
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
      combination["assumedProfit"] = calculateProfit(
        vehicle,
        passengers,
        distance
      );
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
