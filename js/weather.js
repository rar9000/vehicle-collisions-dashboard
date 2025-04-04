// store already fetched weather so we don’t load it again
const weatherCache = {}

// get weather data using location, time, and optional crash ID
export async function fetchWeather(lat, lon, timestamp, id = null) {
  // if we’ve already fetched this crash’s weather, return it
  if (id && weatherCache[id]) {
    return weatherCache[id]
  }

  // break the timestamp into date and time
  const [date, hour] = timestamp.split("T")
  if (!date || !hour) return "Invalid timestamp"

  const hourStr = hour.slice(0, 2) // get just the hour (e.g. "14")

  // build the API URL with lat, lon, and date
  const url = `https://archive-api.open-meteo.com/v1/era5?latitude=${lat}&longitude=${lon}&start_date=${date}&end_date=${date}&hourly=temperature_2m,weathercode&temperature_unit=fahrenheit`

  try {
    const res = await fetch(url) // load data from API
    if (!res.ok) throw new Error("API error")

    const data = await res.json() // turn it into json

    // find weather for the exact hour
    const index = data.hourly.time.findIndex(t => t.includes(`${hourStr}:00`))
    if (index === -1) return "Weather data unavailable"

    // get the temperature and weather code
    const temp = data.hourly.temperature_2m[index]
    const code = data.hourly.weathercode[index]

    // turn weather code into a readable word
    const descriptions = {
      0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
      45: "Fog", 48: "Depositing rime fog", 51: "Light drizzle", 53: "Moderate drizzle",
      55: "Dense drizzle", 56: "Freezing drizzle light", 57: "Freezing drizzle dense",
      61: "Light rain", 63: "Moderate rain", 65: "Heavy rain",
      66: "Freezing rain light", 67: "Freezing rain heavy",
      71: "Light snow", 73: "Moderate snow", 75: "Heavy snow",
      77: "Snow grains", 80: "Slight rain showers", 81: "Moderate rain showers",
      82: "Violent rain showers", 85: "Light snow showers", 86: "Heavy snow showers",
      95: "Thunderstorm", 96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail"
    }

    // use description if we know it, or just show the code
    const description = descriptions[code] || `Weather code: ${code}`

    const result = `${temp}°F ${description}`

    // store result in cache
    if (id) {
      weatherCache[id] = result
    }

    return result

  } catch (error) {
    console.error("Weather fetch error", error)
    return "Weather unavailable"
  }
}