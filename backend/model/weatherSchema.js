import mongoose from "mongoose";
const weatherSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  searchedAt: {
    type: Date,
    default: Date.now,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
});

const Weather = mongoose.model("Weather", weatherSchema);
export default Weather;
