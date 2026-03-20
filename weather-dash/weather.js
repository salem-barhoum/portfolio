const apiKey = "YOUR_OPENWEATHER_API_KEY"; 


async function updateWeather(city) {
    const statusLog = document.querySelector("#status-log");
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        const data = await response.json();

        if(data.cod === "404") {
            statusLog.innerText = "Target City Not Found";
            return;
        }


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

        statusLog.innerText = "";
    } catch (err) {
        statusLog.innerText = "System Connection Offline";
    }
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
