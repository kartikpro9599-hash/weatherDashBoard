import { Router } from "express";
import axios from "axios";
import { cityValidationSchema } from "../controller/validation.js";
import Weather from "../model/weatherSchema.js";
const specificWeatherRoute = Router();

specificWeatherRoute.get("/specific", async (req, res) => {
  try {
    const { data: city, error } = cityValidationSchema.safeParse(
      req.query.city,
    );

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.issues[0].message,
      });
    }

    const { sessionId } = req.cookies;
    if (!sessionId) {
      return res.status(401).json({
        success: false,
        message: "please allow cookie for this site",
      });
    }

    const { WEATHER_API } = process.env;

    let url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API}&units=metric`;

    const response = await axios.get(url);

    try {
      await Weather.findOneAndUpdate(
        {
          sessionId,
          city: response.data.name,
        },
        {
          $set: {
            country: response.data.sys.country,
            searchedAt: new Date(),
            data: response.data,
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
      weatherData: response.data,
    });
  } catch (error) {
    console.log("error from specificWeatherRoute : ", error);

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
