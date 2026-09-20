import { Router } from "express";
import DefaultWeatherRoute from "./getDefaultWeather.js";
import specificWeatherRoute from "./getSpecificWeather.js";
const apiRoutes = Router();

apiRoutes.use(DefaultWeatherRoute);
apiRoutes.use(specificWeatherRoute);
export default apiRoutes;
