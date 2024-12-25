// DOM Elements
const monthSpan = document.querySelector(".month");
const dayNameSpan = document.querySelector(".day");
const forecastDayNameSpan = document.querySelectorAll(".forecast-day");
const cardContent = document.querySelector(".today .card-body");
const forecastDays = document.querySelectorAll(".forecast");
const searchInput = document.getElementById("search-location");
const suggestionsContainer = document.querySelector(".suggestions");

// handle function for foramting data
function formatDate(dateString, options) {
  return new Date(dateString).toLocaleString("en-US", options);
}

// handle Geolocation api
navigator.geolocation.getCurrentPosition(
  position => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    fetchWeatherData(`${latitude},${longitude}`);
  },
  error => {
    console.error("Geolocation API failed:", error);
    fetchCurrentLocation();
  },
);

// Fetch Weather Data from API
async function fetchWeatherData(query) {
  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?q=${query}&days=3&key=86d9bcab9b8f4a97a2152625240712`,
    );
    if (!response.ok) throw new Error("Failed to fetch weather data");

    const data = await response.json();
    console.log(data);

    updateWeatherUI(data);
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}

// display weather data
function updateWeatherUI(data) {
  let todayData = data.current.last_updated;

  let myDataName = new Date(todayData);
  console.log(myDataName);

  let todayName = formatDate(todayData, { weekday: "long" });
  let monthName = formatDate(todayData, { month: "long" });
  let dayNumber = formatDate(todayData, { day: "numeric" });

  dayNameSpan.textContent = `${todayName}`;

  monthSpan.textContent = `${dayNumber} ${monthName}`;

  // updata today ui
  cardContent.innerHTML = `
    <h5 class="location">${data.location.name}</h5>
    <p class="temperature display-2 fw-bolder text-white">${data.current.temp_c}<sup>°</sup>C</p>
    <div>
      <img loading="lazy" src="${data.current.condition.icon}" alt=${data.current.condition.text} />
    </div>
    <p class="weather-condition text-primary">${data.current.condition.text}</p>
    <div class="d-flex justify-content-between">
      <span>
        <img width="15" height="15" src="./images/icon-umberella.png" alt="umbrella-icon" />  ${data.current.humidity}%
      </span>
      <span>
        <img width="15" height="15" src="./images/icon-wind.png" alt="wind-icon" />
        ${data.current.wind_kph} km/h
      </span>
      <span>
        <img width="15" height="15" src="./images/icon-compass.png" alt="compass-icon" />
        ${data.current.wind_dir}
      </span>
    </div>
  `;

  // update forecast ui
  for (let i = 1; i < 3; i++) {
    let forecastDay = data.forecast.forecastday[i];

    let forecastDate = new Date(forecastDay.date);
    let forecastDayName = forecastDate.toLocaleString("en-US", {
      weekday: "long",
    });

    forecastDayNameSpan[i - 1].textContent = forecastDayName;

    forecastDays[i - 1].innerHTML = `
    <div class="card-body pt-4">
      <h3 class="temperature">${forecastDay.day.maxtemp_c}<sup>°</sup>C</h3>
      <div>
        <img loading="lazy" src="${forecastDay.day.condition.icon}" alt=${forecastDay.day.condition.text} />
      </div>
      <p class="weather-condition">${forecastDay.day.condition.text}</p>
    </div>
    `;
  }

  // Handle Search Input Suggestions
  async function handleSearchInput() {
    const query = searchInput.value;
    if (query.length > 0) {
      const response = await fetch(
        `https://api.weatherapi.com/v1/search.json?q=${query}&key=86d9bcab9b8f4a97a2152625240712`,
      );
      const data = await response.json();
      updateSuggestions(data);
    }
  }

  // Update Suggestions in UI
  function updateSuggestions(data) {
    suggestionsContainer.innerHTML = "";
    suggestionsContainer.classList.toggle("d-none", data.length === 0);

    data.forEach(location => {
      const suggestion = document.createElement("div");
      suggestion.className = "suggestion-item";
      suggestion.textContent = `${location.name}, ${location.region}`;
      suggestion.addEventListener("click", () => {
        fetchWeatherData(location.name);
        clearSuggestions();
      });
      suggestionsContainer.appendChild(suggestion);
    });
    suggestionsContainer.style.background = "#fff";
  }

  // Event Listeners
  searchInput.addEventListener("input", handleSearchInput);
}

// clear suggestions
function clearSuggestions() {
  searchInput.value = "";
  suggestionsContainer.innerHTML = "";
  suggestionsContainer.classList.add("d-none");
}
