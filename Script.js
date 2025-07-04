document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const cityInput = document.getElementById('cityInput');
    const searchBtn = document.getElementById('searchBtn');
    const weatherBox = document.getElementById('weatherBox');
    const errorBox = document.getElementById('errorBox');
    const cityNameEl = document.getElementById('cityName');
    const temperatureEl = document.getElementById('temperature');
    const conditionEl = document.getElementById('condition');
    const humidityEl = document.getElementById('humidity');
    const windSpeedEl = document.getElementById('windSpeed');
    const weatherIconEl = document.getElementById('weatherIcon');
    const currentDateEl = document.getElementById('currentDate');
    const forecastGrid = document.getElementById('forecastGrid');

    // --- API Configuration ---
    // IMPORTANT: Replace with your own OpenWeatherMap API key
    const apiKey = '829da511ee7692165f5445d725ffb208';

    // --- Event Listeners ---
    searchBtn.addEventListener('click', handleSearch);
    cityInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    });

    /**
     * Handles the search action, validates input, and triggers the API call.
     */
    function handleSearch() {
        const city = cityInput.value.trim();
        if (!city) {
            // Silently return if the input is empty
            alert('Please enter a valid city name.');
            return;
        }
        getWeatherData(city);
    }

    /**
     * Fetches current weather and forecast data from the OpenWeatherMap API.
     * @param {string} city - The name of the city to search for.
     */
    async function getWeatherData(city) {
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

        try {
            // Fetch both current weather and forecast data in parallel for efficiency
            const [currentWeatherResponse, forecastResponse] = await Promise.all([
                                                                                   fetch(currentWeatherUrl),
                                                                                   fetch(forecastUrl)
                                                                                   ]);

            if (!currentWeatherResponse.ok || !forecastResponse.ok) {
                showError();
                return;
            }

            const currentWeatherData = await currentWeatherResponse.json();
            const forecastData = await forecastResponse.json();

            // Update the UI with the fetched data
            displayCurrentWeather(currentWeatherData);
            displayForecast(forecastData);

        } catch (error) {
            console.error('Error fetching weather data:', error);
            showError();
        }
    }

    /**
     * Updates the DOM with the current weather information.
     * @param {object} data - The weather data object from the API.
     */
    function displayCurrentWeather(data) {
        errorBox.style.display = 'none';
        weatherBox.style.display = 'block';

        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateEl.textContent = now.toLocaleDateString('en-US', options);

        cityNameEl.textContent = data.name;
        temperatureEl.textContent = `${Math.round(data.main.temp)}°C`;
        conditionEl.textContent = data.weather[0].description;
        humidityEl.textContent = data.main.humidity;
        windSpeedEl.textContent = data.wind.speed.toFixed(1);
        weatherIconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        weatherIconEl.alt = data.weather[0].description;
    }

    /**
     * Processes and displays the 3-day forecast.
     * @param {object} data - The forecast data object from the API.
     */
    function displayForecast(data) {
        forecastGrid.innerHTML = ''; // Clear any previous forecast cards

        // The API returns data in 3-hour intervals. We need to filter it to get one forecast per day.
        const dailyForecasts = [];
        const seenDays = new Set();

        for (const forecast of data.list) {
            const forecastDate = new Date(forecast.dt * 1000);
            const day = forecastDate.getDay();

            // Add the first forecast entry for each new day (and skip today)
            if (day !== new Date().getDay() && !seenDays.has(day)) {
                seenDays.add(day);
                dailyForecasts.push(forecast);
            }
        }

        // Create and append a card for each of the next 3 days
        dailyForecasts.slice(0, 5).forEach(forecast => {
            const card = document.createElement('div');
            card.className = 'forecast-card';

            const date = new Date(forecast.dt * 1000);
            const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });

            card.innerHTML = `
                <p class="day">${dayOfWeek}</p>
                <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="${forecast.weather[0].description}">
                <p class="temp">${Math.round(forecast.main.temp)}°C</p>
            `;
            forecastGrid.appendChild(card);
        });
    }

    function showError() {
        weatherBox.style.display = 'none';
        errorBox.style.display = 'block';
    }
});