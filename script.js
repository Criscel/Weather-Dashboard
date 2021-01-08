function initPage() {
    var cityEl= document.getElementById("city-input");
    var searchEl = document.getElementById("search-button");
    var clearEl = document.getElementById("clear-history");
    var nameEl = document.getElementById("city-name");
    var currentPicEl = document.getElementById("current-pic");
    var currentDescEl = document.querySelector(".description");
    var currentTempEl = document.getElementById("temperature");
    var currentHumidityEl = document.getElementById("humidity");4
    var currentWindEl = document.getElementById("wind-speed");
    var currentUVEl = document.getElementById("UV-index");
    var historyEl = document.getElementById("history");

    let searchHistory = JSON.parse(localStorage.getItem("search")) || [];
    console.log(searchHistory);
    
    let APIKey = "50a31d705e6f82744d489f946e338653";

    function getWeather(cityName) {
        let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + APIKey;
        axios.get(queryURL)
        .then(function(response){
            console.log(response);

//  Display current weather 
            var currentDate = new Date(response.data.dt*1000);
            console.log(currentDate);
            var day = currentDate.getDate();
            var year = currentDate.getFullYear();
            var time = new Date().toLocaleTimeString();
            var monthName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            //nameEl.innerHTML = response.data.name + " (" + day + " " + monthName[currentDate.getMonth()] + " " + year + " @ " + hour + ":" + minutes + ") ";

            nameEl.innerHTML = response.data.name + " (" + day + " " + monthName[currentDate.getMonth()] + " " + year + " @ " + time + ") ";
        
            currentPicEl.setAttribute("src", "https://openweathermap.org/img/wn/" + response.data.weather[0].icon + "@2x.png"); //@2x to magnify image
           
            currentDescEl.innerHTML = (response.data.weather[0].description);
            console.log(response.data.weather[0].description);

            currentTempEl.innerHTML = "Temperature: " + k2f(response.data.main.temp) +  " °F / " + k2c(response.data.main.temp) + " °C";
            currentHumidityEl.innerHTML = "Humidity: " + response.data.main.humidity + "%";
            currentWindEl.innerHTML = "Wind Speed: " + Math.floor(response.data.wind.speed * 3.6) + " KM/H";

        let lat = response.data.coord.lat;
        let lon = response.data.coord.lon;
        let UVQueryURL = "https://api.openweathermap.org/data/2.5/uvi/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey + "&cnt=1";
        axios.get(UVQueryURL)
        .then(function(response){
            let UVIndex = document.createElement("span");
            UVIndex.setAttribute("class","badge badge-danger");
            UVIndex.innerHTML = response.data[0].value;
            currentUVEl.innerHTML = "UV Index: ";
            currentUVEl.append(UVIndex);
        });

//  5-day forecast get request from open weather map api
        let cityID = response.data.id;
        let forecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityID + "&appid=" + APIKey;
        axios.get(forecastQueryURL)
        .then(function(response){

//  display forecast for next 5 days 
            console.log(response);

            var forecastEls = document.querySelectorAll(".forecast");

            for (i=0; i<forecastEls.length; i++) {
                forecastEls[i].innerHTML = "";
                var forecastIndex = i*8 + 4;
                var forecastDate = new Date(response.data.list[forecastIndex].dt * 1000);
                var forecastDay = forecastDate.getDate();
                var forecastMonth = forecastDate.getMonth() + 1;
                var forecastYear = forecastDate.getFullYear();
                var forecastDateEl = document.createElement("p");
                forecastDateEl.setAttribute("class","mt-3 mb-0 forecast-date");
                forecastDateEl.innerHTML = forecastMonth + "/" + forecastDay + "/" + forecastYear;
                forecastEls[i].append(forecastDateEl);
                var forecastWeatherEl = document.createElement("img");
                forecastWeatherEl.setAttribute("src","https://openweathermap.org/img/wn/" + response.data.list[forecastIndex].weather[0].icon + "@2x.png");
                forecastWeatherEl.setAttribute("alt",response.data.list[forecastIndex].weather[0].description);
		console.log(response.data.list[forecastIndex].weather[0].description);

                forecastEls[i].append(forecastWeatherEl);
                var forecastTempEl = document.createElement("p");
                forecastTempEl.innerHTML = "Temp: " + k2f(response.data.list[forecastIndex].main.temp) + " °F / " + k2c(response.data.list[forecastIndex].main.temp) + " °C";
                forecastEls[i].append(forecastTempEl);
                var forecastHumidityEl = document.createElement("p");
                forecastHumidityEl.innerHTML = "Humidity: " + response.data.list[forecastIndex].main.humidity + "%";
                forecastEls[i].append(forecastHumidityEl);
                }
            })
        });  
    }

//search button
    searchEl.addEventListener("click",function() {
        var searchTerm = cityEl.value;
        getWeather(searchTerm);
        searchHistory.push(searchTerm);
        localStorage.setItem("search",JSON.stringify(searchHistory));
        renderSearchHistory();
    })

//clear button
    clearEl.addEventListener("click",function() {
        searchHistory = [];
        renderSearchHistory();
    })

//Function for get Fahrenheit and Celcius using Kelvin
function k2f(K) {
    return Math.floor((K - 273.15) * 9/5) + 32;
}

function k2c(K) {
   return Math.floor(K - 273.15);
}

//Display search history	
    function renderSearchHistory() {
        historyEl.innerHTML = "";
        for (let i=0; i<searchHistory.length; i++) {
                let historyItem = document.createElement("input");
                historyItem.setAttribute("type","text");
                historyItem.setAttribute("readonly",true);
                historyItem.setAttribute("class", "form-control d-block bg-white");
                historyItem.setAttribute("value", searchHistory[i]);
                historyItem.addEventListener("click",function() {
                    getWeather(historyItem.value);
                })
                historyEl.append(historyItem);
            }
    }

    renderSearchHistory();
    if (searchHistory.length > 0) {
        getWeather(searchHistory[searchHistory.length - 1]);
    }

}


initPage();