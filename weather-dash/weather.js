const apiKey = "67419cd209b907296e056003e61d7faf"; 

async function updateWeather(city) {
    const statusLog = document.querySelector("#status-log");
    const cacheKey = `weather_${city.toLowerCase()}`;
    const cachedData = localStorage.getItem(cacheKey);
    const now = new Date().getTime();

    if (cachedData) {
        const parsed = JSON.parse(cachedData);
        if (now - parsed.timestamp < 30 * 60 * 1000) {
            renderUI(parsed.data);
            return;
        }
    }

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        
        if (response.status === 429) {
            const saved = localStorage.getItem(cacheKey);
            if (saved) {
                renderUI(JSON.parse(saved).data);
                statusLog.innerText = "Rate limit reached. Showing cached data.";
            } else {
                statusLog.innerText = "System limit reached. Try again later.";
            }
            return;
        }

        const data = await response.json();

        if(data.cod === "404") {
            statusLog.innerText = "Target City Not Found";
            return;
        }

        localStorage.setItem(cacheKey, JSON.stringify({
            timestamp: now,
            data: data
        }));

        renderUI(data);
        statusLog.innerText = "";
    } catch (err) {
        const saved = localStorage.getItem(cacheKey);
        if (saved) {
            renderUI(JSON.parse(saved).data);
            statusLog.innerText = "System Offline - Showing Cached Data";
        } else {
            statusLog.innerText = "System Connection Offline";
        }
    }
}

function renderUI(data) {
    document.querySelector("#cityName").innerText = data.name;
    document.querySelector("#temp").innerText = Math.round(data.main.temp) + "°";
    document.querySelector("#humidity").innerText = data.main.humidity + "%";
    document.querySelector("#wind").innerText = data.wind.speed + " km/h";
    document.querySelector("#pressure").innerText = data.main.pressure;
    document.querySelector("#description").innerText = data.weather[0].description;
    document.querySelector("#weatherIcon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;

    const overlay = document.querySelector("#skyOverlay");
    const condition = data.weather[0].main;
    overlay.className = "sky-overlay"; 
    if(["Rain", "Drizzle", "Thunderstorm"].includes(condition)) overlay.classList.add("rainy-bg");
    if(condition === "Clear") overlay.classList.add("sunny-bg");

    window.parent.postMessage({ type: 'WEATHER_UPDATE', condition: condition }, '*');
}

async function detectVisitorLocation() {
    try {
        const geoResponse = await fetch('https://ipapi.co/json/');
        const geoData = await geoResponse.json();
        
        if (geoData.city) {
            updateWeather(geoData.city);
        } else {
            updateWeather("Damascus"); 
        }
    } catch (error) {
        console.log("Location blocked or failed, defaulting...");
        updateWeather("Damascus");
    }
}

document.querySelector("#searchBtn").addEventListener("click", () => {
    const city = document.querySelector("#cityInput").value;
    if(city) updateWeather(city);
});

detectVisitorLocation();
