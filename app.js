const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".Location-btn");
const weatherCardDiv = document.querySelector(".weather-cards");
const currentWeatherDiv = document.querySelector(".current-weather");
const recentCitiesDropdown = document.getElementById("recentCities");

const API_KEY = "3406bed25d0417b2e84a88ab57478de0";

// Utility function to save city in localStorage
const saveRecentCity = (cityName) => {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  if (!cities.includes(cityName)) {
    cities.push(cityName);
    localStorage.setItem("recentCities", JSON.stringify(cities));
    updateRecentCitiesDropdown();
  }
};

// Update the dropdown with recent cities
const updateRecentCitiesDropdown = () => {
  const cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  recentCitiesDropdown.innerHTML = `<option value="">Select a city</option>`;
  cities.forEach((city) => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    recentCitiesDropdown.appendChild(option);
  });
  recentCitiesDropdown.classList.toggle("hidden", cities.length === 0);
};

// Fetch and display weather details
const getWeatherDetails = (cityName, lat, lon) => {
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

  fetch(WEATHER_API_URL)
    .then((res) => res.json())
    .then((data) => {
      const uniqueForecastDays = [];
      const fiveDaysForecast = data.list.filter((forecast) => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
          return uniqueForecastDays.push(forecastDate);
        }
      });

      cityInput.value = "";
      weatherCardDiv.innerHTML = "";
      currentWeatherDiv.innerHTML = "";

      fiveDaysForecast.forEach((weatherItem, index) => {
        if (index === 0) {
          currentWeatherDiv.innerHTML = `
            <h2 class =" font-bold ">${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
            <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
            <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
            <h4 >Humidity: ${weatherItem.main.humidity}%</h4>
            <div class="icon ">
                 <img src ="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="Weather-Icon">
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>
          `;
        } else {
          weatherCardDiv.innerHTML += `
            <li class="card bg-gray-600 text-white p-4 rounded-md">
              <h3>${weatherItem.dt_txt.split(" ")[0]}</h3>
              <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="Weather-Icon ">
              <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
              <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
              <h4>Humidity: ${weatherItem.main.humidity}%</h4>
            </li>`;
        }
      });

      saveRecentCity(cityName);
    })
    .catch(() => alert("Error fetching weather details. Please try again."));
};

// Fetch city coordinates
const getCityCoordinates = () => {
  const cityName = cityInput.value.trim();
  if (!cityName) return alert("Please enter a city name.");
  const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

  fetch(GEOCODING_API_URL)
    .then((res) => res.json())
    .then((data) => {
      if (!data.length) return alert(`No coordinates found for ${cityName}`);
      const { name, lat, lon } = data[0];
      getWeatherDetails(name, lat, lon);
    })
    .catch(() => alert("Error fetching city coordinates."));
};

// Get user's current location
const getUserCoordinates = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

      fetch(REVERSE_GEOCODING_URL)
        .then((res) => res.json())
        .then((data) => {
          const { name } = data[0];
          getWeatherDetails(name, latitude, longitude);
        })
        .catch(() => alert("Error fetching your current location."));
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        alert("Location permission denied. Please allow access to use this feature.");
      }
    }
  );
};

// Event Listeners
searchButton.addEventListener("click", getCityCoordinates);
locationButton.addEventListener("click", getUserCoordinates);
recentCitiesDropdown.addEventListener("change", (e) => {
  if (e.target.value) {
    cityInput.value = e.target.value;
    getCityCoordinates();
  }
});

// Initialize dropdown on load
document.addEventListener("DOMContentLoaded", updateRecentCitiesDropdown);
