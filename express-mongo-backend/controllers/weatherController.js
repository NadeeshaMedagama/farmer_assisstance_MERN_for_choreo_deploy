const weatherService = require('../services/weatherService');

exports.current = async (req, res, next) => {
  try {
    const { lat, lon, city } = req.query;
    if (!lat || !lon) return res.status(400).json({ success: false, message: 'lat and lon are required' });
    const data = await weatherService.getCurrentByCoords(lat, lon, city);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.historical = async (req, res, next) => {
  try {
    const { lat, lon, days = 7 } = req.query;
    if (!lat || !lon) return res.status(400).json({ success: false, message: 'lat and lon are required' });
    const data = await weatherService.getHistoricalWeather(lat, lon, parseInt(days));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.stats = async (req, res, next) => {
  try {
    const { lat, lon, days = 30 } = req.query;
    if (!lat || !lon) return res.status(400).json({ success: false, message: 'lat and lon are required' });
    const data = await weatherService.getWeatherStats(lat, lon, parseInt(days));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
