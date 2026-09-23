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
    const { error: parseError } = locationValidateSchema.safeParse({
      lat: lat,
      lon: lon,
    });

    if (parseError) {
      return res.status(400).json({
        success: false,
        message: "invalid location",
      });
    }
  }
  try {
    const [currentResult, forecastResult] = await Promise.allSettled([
      fetchCurrentWeather(lat, lon),
      fetchForecast(lat, lon),
    ]);

    const currentWeather =
      currentResult.status === "fulfilled" ? currentResult.value : null;
    const forecastWeather =
      forecastResult.status === "fulfilled" ? forecastResult.value : null;

    if (!currentWeather) {
      return res.status(503).json({
        success: false,
        message: "failed to fetched real weather data",
        weatherData: exampleData,
        forecastData: forecastWeather,
      });
    }

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
      weatherData: currentWeather,
      forecastData: forecastWeather,
    });
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: "failed to fetched real weather data",
      weatherData: exampleData,
      forecastData: null,
    });
  }
});

function buildQueryParams(lat, lon) {
  const { WEATHER_API } = process.env;
  if (!lat || !lon) {
    return `q=Delhi&appid=${WEATHER_API}&units=metric`;
  }
  return `lat=${lat}&lon=${lon}&appid=${WEATHER_API}&units=metric`;
}

async function fetchCurrentWeather(lat, lon) {
  const params = buildQueryParams(lat, lon);
  const url = `https://api.openweathermap.org/data/2.5/weather?${params}`;
  const response = await axios.get(url);
  return response.data;
}

async function fetchForecast(lat, lon) {
  const params = buildQueryParams(lat, lon);
  const url = `https://api.openweathermap.org/data/2.5/forecast?${params}`;
  const response = await axios.get(url);
  return response.data;
}

export default DefaultWeatherRoute;
