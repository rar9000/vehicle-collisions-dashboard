// Fetches weather data based on location and time
export async function fetchWeather(lat, lon, timestamp) {
    const [date, hour] = timestamp.split("T") // Split timestamp into date and hour
    if (!date || !hour) return "Invalid timestamp"
  
    const hourStr = hour.slice(0, 2) // Get the hour in two digit format
  
    // Builds the api request url using latitude longitude and date
    const url = `https://archive-api.open-meteo.com/v1/era5?latitude=${lat}&longitude=${lon}&start_date=${date}&end_date=${date}&hourly=temperature_2m,weathercode&temperature_unit=fahrenheit`
  
    try {
      const res = await fetch(url) // Send request to weather api
      if (!res.ok) throw new Error(`Weather API error: ${res.statusText}`) // Stop if request fails
      const data = await res.json() // Parse the response as json
  
      // Find the weather data for the specific hour
      const index = data.hourly.time.findIndex(t => t.includes(`${hourStr}:00`))
      if (index === -1) return "Weather data unavailable"
  
      // Get temperature and weather code for that hour
      const temp = data.hourly.temperature_2m[index]
      const code = data.hourly.weathercode[index]
  
      // Maps weather codes to simple descriptions
      const descriptions = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        56: "Freezing drizzle light",
        57: "Freezing drizzle dense",
        61: "Light rain",
        63: "Moderate rain",
        65: "Heavy rain",
        66: "Freezing rain light",
        67: "Freezing rain heavy",
        71: "Light snow",
        73: "Moderate snow",
        75: "Heavy snow",
        77: "Snow grains",
        80: "Slight rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",
        85: "Light snow showers",
        86: "Heavy snow showers",
        95: "Thunderstorm",
        96: "Thunderstorm with slight hail",
        99: "Thunderstorm with heavy hail"
      }
  
      // Get description for the weather code or show the code if unknown
      const description = descriptions[code] || `Weather code: ${code}`
  
      // Return formatted string with temperature and description
      return `${temp}°F ${description}`
  
    } catch (error) {
      console.error("Weather fetch error", error)
      return "Weather unavailable"
    }
  }