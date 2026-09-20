import { Router } from "express";
import DefaultWeatherRoute from "./getDefaultWeather.js";
import specificWeatherRoute from "./getSpecificWeather.js";
import historyRoute from "./getHistory.js";

const apiRoutes = Router();

apiRoutes.use(DefaultWeatherRoute);
apiRoutes.use(specificWeatherRoute);
apiRoutes.use(historyRoute);
export default apiRoutes;
