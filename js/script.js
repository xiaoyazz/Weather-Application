/*
** Weather Application Javescript File
** Created by : Xiaoya Zou
** Created on: Oct 23, 2022
*/

// Get elemenmt by their class names for current city weather details
let searchInp = document.querySelector('.weather-search'); 
let city = document.querySelector('.weather-city');
let day = document.querySelector('.weather-day'); 
let humidity = document.querySelector('.weather-indicator--humidity>.value'); // For humidity, wind, and pressure, get the value instead of the indicator itself
let wind = document.querySelector('.weather-indicator--wind>.value');
let pressure = document.querySelector('.weather-indicator--pressure>.value');
let image = document.querySelector('.weather-image');
let temperature = document.querySelector('.weather-temperature>.value');
let forecastBlock = document.querySelector('.weather-forecast');

// Weather API
let weatherAPIKey = '84f4dde0ea6a0bf2e3864301871f625e';
let weatherBaseEndPoint = 'https://api.openweathermap.org/data/2.5/weather?units=metric&appid=' + weatherAPIKey;
let forecastBaseEndPoint = 'https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=' + weatherAPIKey;
let geocodingBaseEndPoint = 'http://api.openweathermap.org/geo/1.0/direct?&limit=5&appid='+ weatherAPIKey + '&q=';
let datalist = document.getElementById('suggestions');

// Get images in groups
let weatherImages = [
    {
        url: 'images/clear-sky.png',
        ids: [800]
    },
    {
        url: 'images/broken-clouds.png',
        ids: [803, 804]
    },
    {
        url: 'images/few-clouds.png',
        ids: [801]
    }, 
    {
        url: 'images/mist.png',
        ids: [701, 711, 721, 731, 741, 751, 761, 771, 781]
    }, 
    {
        url: 'images/rain.png',
        ids: [500, 501, 502, 503, 504]
    }, 
    {
        url: 'images/scattered-clouds.png',
        ids: [802]
    }, 
    {
        url: 'images/shower.png',
        ids: [520, 521, 522, 531, 301, 302, 310, 311, 312, 314, 321]
    }, 
    {
        url: 'images/snow.png',
        ids: [511, 600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622]
    },
    {
        url: 'images/thunderstorm.png',
        ids: [200, 201, 202, 210, 211, 212, 221, 230, 231, 232]
    },
]

// Get the current weather data from API
let getWeatherByCityName = async (city) => {
    let endpoint = weatherBaseEndPoint + '&q=' + city;
    let response = await fetch(endpoint);
    let weather = response.json();
    return weather;
}

// Get the forecast weather data from API
let getWeatherByCityID = async(id) => {
    let endpoint = forecastBaseEndPoint + '&id=' + id;
    let result = await fetch(endpoint);
    let forecast = await result.json();
    let forecastList = forecast.list;
    let daily = [];
    // console.log(forecast);

    forecastList.forEach(day => {
        let date = new Date(day.dt_txt.replace(' ', 'T')); // Convert the date & time in the MDN dates format
        let hours = date.getHours(); // Get the time of the day
        if (hours === 12) { // If the hour is 12, then add the day to the daily array
            daily.push(day);
        }
    })
    return daily;
}
let weatherForCity = async (city) => {
    let weather = await getWeatherByCityName(city); // Call the getWeatherByCityName function
    console.log(weather);
        let cityID = weather.id;
    if (weather.cod === '404') {
        return;
    } else {
        updateCurrentWeather(weather);
        let forecast = await getWeatherByCityID(cityID);
        updateForecast(forecast);
    }
}

// When user search for a city, there is an action should be taken
searchInp.addEventListener('keydown', async (e) => {  // e stores the event
    if (e.keyCode === 13) { // If user press the enter key
        weatherForCity(searchInp.value);
    }
})

// Add another eventlistener to get the location suggestions
searchInp.addEventListener('input', async () => {
    if (searchInp.value.length <= 2) { // Avoid the error when user type the first 2 letters
        return;
    }
    let endpoint = geocodingBaseEndPoint + searchInp.value;
    let result = await (await fetch(endpoint)).json();
    datalist.innerHTML = ''; // Remove the previous searching history
    result.forEach((city) => { // Get the correct city data with country and state
        let option = document.createElement('option');
        option.value = `${city.name}${city.state ? ', ' + city.state : ''}, ${city.country}`;
        datalist.appendChild(option);
    })
})

// Display the weather information
let updateCurrentWeather = (data) => {
    city.textContent = data.name + ', ' + data.sys.country;
    day.textContent = dayOfWeek();
    humidity.textContent = data.main.humidity;
    pressure.textContent = data.main.pressure;

    let windDirection;
    let deg = data.wind.deg;
    if (deg > 45 && deg <= 135) { // Decide the wind direction
        windDirection = 'East';
    } else if (deg > 135 && deg <= 225) {
        windDirection = 'South';
    }else if (deg > 225 && deg <= 315) {
        windDirection = 'West';
    }else {
        windDirection = 'North';
    }
    wind.textContent = windDirection + ', ' + data.wind.speed // Wind information includes two parts: the direction and the speed
    
    temperature.textContent = data.main.temp > 0 ?
        '+' + Math.round(data.main.temp) :
        Math.round(data.main.temp);
    
    // Update the images
    let imgID = data.weather[0].id;
    weatherImages.forEach(obj => {
        if (obj.ids.includes(imgID)) {
            image.src = obj.url;
        }
    })
}

// Display the 5-day forcast information
let updateForecast = (forecast) => {
    forecastBlock.innerHTML = ''; // Everytime needs to delete the information stored in forecastBlock
    forecast.forEach(day => {
        let iconURL = ' http://openweathermap.org/img/wn/' + day.weather[0].icon + '@2x.png';    
        let dayName = dayOfWeek(day.dt * 1000); // Convert seconds to milliseconds
        let temperature = day.main.temp > 0 ?
            '+' + Math.round(day.main.temp) :
            Math.round(day.main.temp);
        let forcastItem = `
        <article class="weather-forecast-item">
            <img
            src="${iconURL}"
            alt="${day.weather[0].description}"
            class="weather-forecast-icon"
            />
            <h4 class="weather-forecast-day">${dayName}</h4>
            <p class="weather-forecast-temperature">
                <span class="value">${temperature}</span> &deg;C
            </p>
        </article>
        `;
        forecastBlock.insertAdjacentHTML('beforeend', forcastItem);
    })
}

// A function to get the current day
let dayOfWeek = (dt = new Date().getTime()) => {
    return new Date(dt).toLocaleDateString('en-EN', {'weekday': 'long'}); // Get the local day and display in English
}

// A function to show current location and weather when user open my page 
let init = async () => {
    await weatherForCity('Toronto'); // Use Toronto as default
    document.body.style.filter = 'blur(0)';
}
init();