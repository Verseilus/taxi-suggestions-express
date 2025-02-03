const mongoose = require("mongoose");

// establish connection to MongoDB (mongodb://[username]:[password]@[db_container]:[port])
const connectDatabase = async () => {
  try {
    await mongoose.connect("mongodb://taxiadmin:mdbtaxipw@database:27017");
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDatabase;
