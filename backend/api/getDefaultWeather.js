import { Router } from "express";
import axios from "axios";
import { exampleData } from "./samples/data.js";
import { randomUUID } from "node:crypto";
import { locationValidateSchema } from "../controller/validation.js";
const DefaultWeatherRoute = Router();

DefaultWeatherRoute.get("/default", async (req, res) => {
  const { lat, lon } = req.query;

  if (
    (lat !== null && lat !== undefined) ||
    (lon !== null && lon !== undefined)
  ) {
    const { error } = locationValidateSchema.safeParse({
      lat: lat,
      lon: lon,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "invalid location",
      });
    }
  }
  try {
    const data = await fetchData(lat, lon);

    if (!req.cookies.sessionId) {
      const id = randomUUID();
      res.cookie("sessionId", id, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 1000 * 60 * 24 * 30,
      });
    }

    return res.status(200).json({
      success: true,
      message: "successfully fetched weather data",
      weatherData: data,
    });
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: "failed to fetched real weather data",
      weatherData: exampleData,
    });
  }
});

async function fetchData(lattitud, longitude) {
  let url;
  const { WEATHER_API } = process.env;

  if (!lattitud || !longitude) {
    url = `https://api.openweathermap.org/data/2.5/weather?q=Delhi&appid=${WEATHER_API}&units=metric`;
  } else {
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${lattitud}&lon=${longitude}&appid=${WEATHER_API}&units=metric`;
  }

  try {
    let response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.log("error comes from defaulRoute : ", error);
    throw error;
  }
}

export default DefaultWeatherRoute;
