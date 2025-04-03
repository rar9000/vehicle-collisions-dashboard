// import the function that fetches weather data
import { fetchWeather } from './weather.js'

// builds popup for neighborhood shapes
export function createNeighborhoodPopup(props, crashCounts, crashRatePop, crashRateArea) {
  const name = props.nh_name
  const population = props.population
  const squareMiles = props.square_miles
  const crashes = crashCounts[name] || 0

  return `
    <b>${name}</b><br>
    Population: ${population.toLocaleString()}<br>
    Area: ${squareMiles.toFixed(2)} mi²<br>
    Crashes: ${crashes}<br>
    Crash Rate (per 1000 people): ${crashRatePop[name] || "N/A"}<br>
    Crash Rate (per sq mi): ${crashRateArea[name] || "N/A"}
  `
}

// builds full crash popup with data and weather
export async function buildCrashPopup({ id, lat, lon, lookup }) {
  if (!lookup) {
    return createCrashPopupError(id)
  }

  const weather = await fetchWeather(lat, lon, lookup.timestamp)

  const killed = lookup.numberkilled ?? "0"
  const injured = lookup.numberinjured ?? "0"
  const hitAndRun = lookup.hitandrun === true ? "Yes" : "No"

  const date = new Date(lookup.timestamp)
  const timeFormatted = formatTime(date)

  const neighborhood = lookup.nh_name?.trim() || "No Neighborhood"

  return createCrashPopupFull({
    id,
    nhName: neighborhood,
    weather,
    time: timeFormatted,
    killed,
    injured,
    hitAndRun
  })
}

// helper to build full crash popup html
function createCrashPopupFull({ id, nhName, weather, time, killed, injured, hitAndRun }) {
  return `
    <b>Incident Number:</b> ${id}<br>
    <b>Neighborhood:</b> ${nhName}<br>
    <b>Weather:</b> ${weather}<br>
    <b>Time:</b> ${time}<br>
    <b>Hit & Run:</b> ${hitAndRun}<br>
    <b>Injured:</b> ${injured}<br>
    <b>Killed:</b> ${killed}<br>
  `
}

// fallback if no lookup is found
export function createCrashPopupError(id) {
  return `
    <b>Incident Number:</b> ${id}<br>
    <b style="color:red;">Weather data unavailable</b>
  `
}

// helper to convert time to AM PM format
function formatTime(date) {
  const hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}