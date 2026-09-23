import { Router } from "express";
import Weather from "../model/weatherSchema.js";
import session from "../controller/session.controller.js";

const historyRoute = Router();

historyRoute.get("/history", session, async (req, res) => {
  try {
    const { sessionId } = req;
    const history = await Weather.find(
      { sessionId },
      {
        city: 1,
        _id: 0,
      },
    ).sort({
      searchedAt: -1,
    });
    console.log(history);
    if (history.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No search history found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "successfully found history",
      history,
    });
  } catch (error) {
    console.log("error from history route", error);
    return res.status(500).json({
      success: false,
      message: "internal error could not find data",
    });
  }
});

export default historyRoute;
