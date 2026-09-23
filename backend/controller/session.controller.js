function session(req, res, next) {
  const { sessionId } = req.cookies;
  if (!sessionId) {
    return res.status(401).json({
      success: false,
      message: "please allow cookie for this site",
    });
  }
  req.sessionId = sessionId;
  next();
}
export default session;
