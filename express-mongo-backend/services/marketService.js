const axios = require('axios');
const Market = require('../models/Market');

class MarketService {
  async list(query = {}) {
    const filter = {};
    if (query.crop) filter['crop.name'] = new RegExp(query.crop, 'i');
    if (query.city) filter['location.city'] = new RegExp(query.city, 'i');
    return Market.find(filter).sort({ updatedAt: -1 }).limit(Number(query.limit || 50));
  }

  async upsertPrice(payload) {
    // Check if this is a simplified payload (from farmers)
    if (payload.productName && payload.price && payload.location && payload.unit) {
      return this.handleSimplifiedPayload(payload);
    }
    
    // Handle complex payload (from experts/admins)
    const { crop, location, prices, demand, supply, seasonality, marketConditions } = payload;
    const doc = await Market.findOneAndUpdate(
      { 'crop.name': crop.name, 'location.city': location.city, 'location.market': location.market },
      { crop, location, prices, demand, supply, seasonality, marketConditions, dataSource: payload.dataSource || { provider: 'manual' } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return doc;
  }

  async handleSimplifiedPayload(payload) {
    const { productName, price, unit, location, date, source } = payload;
    
    // Transform simplified data to match Market schema
    const marketData = {
      crop: {
        name: productName,
        type: 'other', // Default type, can be enhanced later
        grade: 'standard'
      },
      location: {
        market: 'Local Market', // Default market name
        city: location,
        state: 'Unknown', // Default state
        country: 'Sri Lanka' // Default country
      },
      prices: {
        wholesale: {
          min: price * 0.8, // Estimate min as 80% of given price
          max: price * 1.2, // Estimate max as 120% of given price
          average: price,
          unit: unit
        }
      },
      demand: {
        level: 'medium', // Default demand level
        trend: 'stable' // Default trend
      },
      supply: {
        level: 'medium', // Default supply level
        trend: 'stable' // Default trend
      },
      seasonality: {
        isInSeason: true // Default to in season
      },
      dataSource: {
        provider: source || 'farmer_report',
        reliability: 'medium'
      }
    };

    // Add to price history if date is provided
    if (date) {
      marketData.priceHistory = [{
        date: new Date(date),
        wholesale: {
          average: price
        },
        demand: 'medium',
        supply: 'medium'
      }];
    }

    const doc = await Market.findOneAndUpdate(
      { 'crop.name': productName, 'location.city': location },
      marketData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return doc;
  }

  async externalLookup(name) {
    const api = process.env.MARKET_API_URL;
    if (!api) return { source: 'none', data: [] };
    const { data } = await axios.get(`${api}?q=${encodeURIComponent(name)}`);
    return { source: 'external', data };
  }
}

module.exports = new MarketService();
