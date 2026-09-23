import { Router } from "express";
import session from "../controller/session.controller.js";
import Weather from "../model/weatherSchema.js";
import { cityValidationSchema } from "../controller/validation.js";

const deleteHistoryRoute = Router();

deleteHistoryRoute.delete("/deleteHistory/:city", session, async (req, res) => {
  try {
    const { sessionId } = req;
    const { data: city, error: parseError } = cityValidationSchema.safeParse(
      req.params.city,
    );

    if (parseError) {
      return res.status(400).json({
        success: false,
        message: parseError.issues[0].message,
      });
    }

    const result = await Weather.findOneAndDelete({
      sessionId,
      city,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "delete req history not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "requested history successfully deleted",
      data: result.city,
    });
  } catch (error) {
    console.log("error comes from deleteHistory Route : ", error);
    return res.status(500).json({
      success: false,
      message: "failed to delete history",
    });
  }
});

export default deleteHistoryRoute;
