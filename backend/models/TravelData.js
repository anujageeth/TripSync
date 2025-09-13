const mongoose = require('mongoose');

const TravelDataSchema = new mongoose.Schema({
  city: String,
  places: [String],
  hotels: [
    {
      name: String,
      type: String,
      meals: {
        breakfast: [String],
        lunch: [String],
        dinner: [String],
      }
    }
  ]
});

const TravelDataModel = mongoose.model("travelData", TravelDataSchema);
module.exports = TravelDataModel;
