const axios = require('axios');
const Weather = require('../models/Weather');
const logger = require('../utils/logger');

class WeatherService {
  async getCurrentByCoords(lat, lon, city = null) {
    try {
      // Check if we have recent data (within last hour)
      const recentWeather = await Weather.findOne({
        'location.coordinates.latitude': parseFloat(lat),
        'location.coordinates.longitude': parseFloat(lon),
        'current.timestamp': { $gte: new Date(Date.now() - 60 * 60 * 1000) }, // 1 hour ago
        isActive: true
      }).sort({ 'current.timestamp': -1 });

      if (recentWeather) {
        logger.info(`Returning cached weather data for ${lat}, ${lon}`);
        return recentWeather;
      }

      // Fetch fresh data from API
      const weatherData = await this.fetchWeatherFromAPI(lat, lon);
      
      // Store in database
      const storedWeather = await this.storeWeatherData(weatherData, lat, lon, city);
      
      return storedWeather;
    } catch (error) {
      logger.error('Weather service error:', error);
      throw error;
    }
  }

  async fetchWeatherFromAPI(lat, lon) {
    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
      logger.warn('WEATHER_API_KEY not configured, using open-meteo');
    }

    // Use Open-Meteo API (free, no key required)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=auto`;
    
    const { data } = await axios.get(url);
    return data;
  }

  async storeWeatherData(apiData, lat, lon, city = null) {
    try {
      const current = apiData.current;
      const hourly = apiData.hourly;
      const daily = apiData.daily;

      // Transform API data to our schema
      const weatherData = {
        location: {
          name: city || `Location ${lat}, ${lon}`,
          coordinates: {
            latitude: parseFloat(lat),
            longitude: parseFloat(lon)
          },
          address: {
            city: city || null,
            state: null,
            country: null
          }
        },
        current: {
          temperature: {
            value: current.temperature_2m,
            unit: 'celsius',
            feelsLike: current.temperature_2m // API doesn't provide feels like
          },
          humidity: current.relative_humidity_2m,
          wind: {
            speed: current.wind_speed_10m,
            direction: current.wind_direction_10m,
            unit: 'kmh'
          },
          conditions: {
            main: this.getWeatherCondition(current.weather_code),
            description: this.getWeatherDescription(current.weather_code),
            icon: this.getWeatherIcon(current.weather_code)
          },
          timestamp: new Date()
        },
        forecast: this.buildForecastData(hourly, daily),
        agriculturalData: this.calculateAgriculturalData(current, hourly),
        dataSource: {
          provider: 'open-meteo',
          apiVersion: 'v1',
          lastUpdated: new Date()
        }
      };

      // Store or update weather data
      const weather = await Weather.findOneAndUpdate(
        {
          'location.coordinates.latitude': parseFloat(lat),
          'location.coordinates.longitude': parseFloat(lon)
        },
        weatherData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      logger.info(`Weather data stored for ${lat}, ${lon}`);
      return weather;
    } catch (error) {
      logger.error('Error storing weather data:', error);
      throw error;
    }
  }

  buildForecastData(hourly, daily) {
    const forecast = [];
    
    // Build daily forecast from daily data
    if (daily && daily.time) {
      for (let i = 0; i < Math.min(daily.time.length, 7); i++) {
        forecast.push({
          date: new Date(daily.time[i]),
          temperature: {
            min: daily.temperature_2m_min[i],
            max: daily.temperature_2m_max[i],
            average: (daily.temperature_2m_min[i] + daily.temperature_2m_max[i]) / 2
          },
          precipitation: {
            probability: hourly ? this.calculateDailyPrecipitationProbability(hourly, i) : 0,
            amount: daily.precipitation_sum ? daily.precipitation_sum[i] : 0,
            unit: 'mm'
          },
          conditions: {
            main: this.getWeatherCondition(daily.weather_code[i]),
            description: this.getWeatherDescription(daily.weather_code[i]),
            icon: this.getWeatherIcon(daily.weather_code[i])
          }
        });
      }
    }

    return forecast;
  }

  calculateDailyPrecipitationProbability(hourly, dayIndex) {
    if (!hourly || !hourly.precipitation_probability) return 0;
    
    const startHour = dayIndex * 24;
    const endHour = startHour + 24;
    const dayProbabilities = hourly.precipitation_probability.slice(startHour, endHour);
    
    return Math.max(...dayProbabilities) || 0;
  }

  calculateAgriculturalData(current, hourly) {
    const temp = current.temperature_2m;
    const humidity = current.relative_humidity_2m;
    
    return {
      soilTemperature: temp - 2, // Rough estimate
      soilMoisture: this.estimateSoilMoisture(humidity),
      growingDegreeDays: this.calculateGrowingDegreeDays(temp),
      chillHours: this.calculateChillHours(temp),
      frostRisk: this.assessFrostRisk(temp),
      irrigationRecommendation: this.getIrrigationRecommendation(humidity, temp),
      pestRisk: this.assessPestRisk(temp, humidity),
      diseaseRisk: this.assessDiseaseRisk(temp, humidity)
    };
  }

  estimateSoilMoisture(humidity) {
    return Math.max(0, Math.min(100, humidity + Math.random() * 20 - 10));
  }

  calculateGrowingDegreeDays(temp) {
    const baseTemp = 10; // Base temperature for most crops
    return Math.max(0, temp - baseTemp);
  }

  calculateChillHours(temp) {
    return temp < 7 ? 1 : 0; // Simplified calculation
  }

  assessFrostRisk(temp) {
    if (temp < -2) return 'extreme';
    if (temp < 0) return 'high';
    if (temp < 2) return 'medium';
    return 'low';
  }

  getIrrigationRecommendation(humidity, temp) {
    if (humidity < 30) return 'heavy';
    if (humidity < 50) return 'moderate';
    if (humidity < 70) return 'light';
    return 'not_needed';
  }

  assessPestRisk(temp, humidity) {
    if (temp > 25 && humidity > 70) return 'high';
    if (temp > 20 && humidity > 60) return 'medium';
    return 'low';
  }

  assessDiseaseRisk(temp, humidity) {
    if (humidity > 80) return 'high';
    if (humidity > 60 && temp > 20) return 'medium';
    return 'low';
  }

  getWeatherCondition(code) {
    const conditions = {
      0: 'Clear',
      1: 'Mainly Clear',
      2: 'Partly Cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing Rime Fog',
      51: 'Light Drizzle',
      53: 'Moderate Drizzle',
      55: 'Dense Drizzle',
      61: 'Slight Rain',
      63: 'Moderate Rain',
      65: 'Heavy Rain',
      71: 'Slight Snow',
      73: 'Moderate Snow',
      75: 'Heavy Snow',
      80: 'Slight Rain Showers',
      81: 'Moderate Rain Showers',
      82: 'Violent Rain Showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with Hail',
      99: 'Heavy Thunderstorm with Hail'
    };
    return conditions[code] || 'Unknown';
  }

  getWeatherDescription(code) {
    const descriptions = {
      0: 'Clear sky',
      1: 'Mainly clear sky',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy conditions',
      48: 'Rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with hail',
      99: 'Heavy thunderstorm with hail'
    };
    return descriptions[code] || 'Unknown conditions';
  }

  getWeatherIcon(code) {
    const icons = {
      0: '01d',
      1: '02d',
      2: '03d',
      3: '04d',
      45: '50d',
      48: '50d',
      51: '09d',
      53: '09d',
      55: '09d',
      61: '10d',
      63: '10d',
      65: '10d',
      71: '13d',
      73: '13d',
      75: '13d',
      80: '09d',
      81: '09d',
      82: '09d',
      95: '11d',
      96: '11d',
      99: '11d'
    };
    return icons[code] || '01d';
  }

  // Get historical weather data
  async getHistoricalWeather(lat, lon, days = 7) {
    try {
      const weather = await Weather.find({
        'location.coordinates.latitude': parseFloat(lat),
        'location.coordinates.longitude': parseFloat(lon),
        isActive: true
      })
      .sort({ 'current.timestamp': -1 })
      .limit(days);

      return weather;
    } catch (error) {
      logger.error('Error fetching historical weather:', error);
      throw error;
    }
  }

  // Get weather statistics
  async getWeatherStats(lat, lon, days = 30) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const stats = await Weather.aggregate([
        {
          $match: {
            'location.coordinates.latitude': parseFloat(lat),
            'location.coordinates.longitude': parseFloat(lon),
            'current.timestamp': { $gte: startDate },
            isActive: true
          }
        },
        {
          $group: {
            _id: null,
            avgTemperature: { $avg: '$current.temperature.value' },
            maxTemperature: { $max: '$current.temperature.value' },
            minTemperature: { $min: '$current.temperature.value' },
            avgHumidity: { $avg: '$current.humidity' },
            totalRainfall: { $sum: '$forecast.precipitation.amount' },
            count: { $sum: 1 }
          }
        }
      ]);

      return stats[0] || {};
    } catch (error) {
      logger.error('Error calculating weather stats:', error);
      throw error;
    }
  }
}

module.exports = new WeatherService();
