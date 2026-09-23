import { Router } from "express";
import DefaultWeatherRoute from "./getDefaultWeather.js";
import specificWeatherRoute from "./getSpecificWeather.js";
import historyRoute from "./getHistory.js";
import deleteHistoryRoute from "./deleteHistory.js";

const apiRoutes = Router();

apiRoutes.use(DefaultWeatherRoute);
apiRoutes.use(specificWeatherRoute);
apiRoutes.use(historyRoute);
apiRoutes.use(deleteHistoryRoute);

export default apiRoutes;
