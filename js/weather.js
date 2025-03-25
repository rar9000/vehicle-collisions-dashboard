
export async function fetchWeather(lat, lon, timestamp) {
    const [date, hour] = timestamp.split("T");
    if (!date || !hour) return "Invalid timestamp";

    const hourStr = hour.slice(0, 2);

    const url = `https://archive-api.open-meteo.com/v1/era5?latitude=${lat}&longitude=${lon}&start_date=${date}&end_date=${date}&hourly=temperature_2m,weathercode&temperature_unit=fahrenheit`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Weather API error: ${res.statusText}`);
        const data = await res.json();

        const index = data.hourly.time.findIndex(t => t.includes(`${hourStr}:00`));
        if (index === -1) return "Weather data unavailable";

        const temp = data.hourly.temperature_2m[index];
        const code = data.hourly.weathercode[index];

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
            56: "Freezing drizzle (light)",
            57: "Freezing drizzle (dense)",
            61: "Light rain",
            63: "Moderate rain",
            65: "Heavy rain",
            66: "Freezing rain (light)",
            67: "Freezing rain (heavy)",
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
        };

        const description = descriptions[code] || `Weather code: ${code}`;
        return `${temp}°F, ${description}`;
    } catch (error) {
        console.error("Weather fetch error:", error);
        return "Weather unavailable";
    }
}