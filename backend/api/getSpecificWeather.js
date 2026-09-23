import { Router } from "express";
import axios from "axios";
import { cityValidationSchema } from "../controller/validation.js";
import Weather from "../model/weatherSchema.js";
import session from "../controller/session.controller.js";

const specificWeatherRoute = Router();

specificWeatherRoute.get("/specific", session, async (req, res) => {
  try {
    const { data: city, error: parseError } = cityValidationSchema.safeParse(
      req.query.city,
    );

    if (parseError) {
      return res.status(400).json({
        success: false,
        message: parseError.issues[0].message,
      });
    }

    const { sessionId } = req;
    const { WEATHER_API } = process.env;
    const encodedCity = encodeURIComponent(city);

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodedCity}&appid=${WEATHER_API}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodedCity}&appid=${WEATHER_API}&units=metric`;

    const [weatherResult, forecastResult] = await Promise.allSettled([
      axios.get(weatherUrl),
      axios.get(forecastUrl),
    ]);

    if (weatherResult.status === "rejected") {
      throw weatherResult.reason;
    }

    const currentWeather = weatherResult.value.data;
    const forecastWeather =
      forecastResult.status === "fulfilled" ? forecastResult.value.data : null;

    try {
      await Weather.findOneAndUpdate(
        {
          sessionId,
          city: currentWeather.name,
        },
        {
          $set: {
            country: currentWeather.sys.country,
            searchedAt: new Date(),
            data: currentWeather,
          },
        },
        {
          upsert: true,
          new: true,
        },
      );
    } catch (dbErrr) {
      console.log("error db write failed", dbErrr);
    }

    res.status(200).json({
      success: true,
      message: "successfully fetched data",
      weatherData: currentWeather,
      forecastData: forecastWeather,
    });
  } catch (error) {
    console.log("error from specificWeatherRoute : ", error.response?.data);

    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: "no details found",
      });
    }

    return res.status(503).json({
      success: false,
      message: "failde to fetch weather data",
    });
  }
});

export default specificWeatherRoute;
