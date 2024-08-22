const userTab = document.querySelector("[data-userWeather]")
const searchTab = document.querySelector("[user-searchWeather]")
const userContainer = document.querySelector(".weather-container")
const grantAccessContainer = document.querySelector(".grant-location-container")
const searchForm = document.querySelector("[data-searchForm]")
const loadingScreen = document.querySelector(".loading-container")
const userInfoContainer = document.querySelector(".user-info-container")

//current tab is initialized by user tab
let oldTab = userTab;
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
//we are adding current-tab property inside our currentTab which is userTab
oldTab.classList.add("current-tab");
getfromSessionStorage();


function switchTab(newTab) {
    if(newTab != oldTab) {
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        oldTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")) {
            //kya search form wala container is invisible, if yes then make it visible
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else {
            //main pehle search wale tab pr tha, ab your weather tab visible karna h 
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            //ab main your weather tab me aagya hu, toh weather bhi display karna poadega, so let's check local storage first
            //for coordinates, if we haved saved them there.
            getfromSessionStorage();
            error.classList.remove("active");
            errorImage.classList.remove("active")
        }
    }
}

//if user tab is click then our clickedtab inside the switch function will be userTAb
userTab.addEventListener("click",()=>{
    switchTab(userTab);//passing clicked tab as a user tab
});

//if search tab is click then our clickedtab inside switch function will be searchTab
searchTab.addEventListener("click",()=>{
    switchTab(searchTab);//passing clicked tab as a search tab
});


//check if the cooradinates are already present there
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates) {
        //agar local coordinates nahi mile
        grantAccessContainer.classList.add("active");
    }
    else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }

}


async function fetchUserWeatherInfo(coordinates){
    const {lat,lon}=coordinates;
    //make grant access invisible
    grantAccessContainer.classList.remove("active");
    //make loader visible
    loadingScreen.classList.add("active")
    //API call
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const  data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err){
      loadingScreen.classList.remove("active");
      error.classList.add("active")
    }
}

const container =document.querySelector(".container")
function renderWeatherInfo(weatherInfo){
    //firstly we have to fetch the elements
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    //fetch values from weatherInfo object and put in UI elements
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
    
}

//finding user current location
function getLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        //HW - show an alert for no gelolocation support available
    }
}
//finding the longitude and latitude and sending it to fetchUserWeatherInfo
function showPosition(position) {

    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);

}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click",getLocation);

const searchInput = document.querySelector("[data-searchInput]");

//in search tab eventlistner on search button
searchForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    let cityName = searchInput.value;
    if(cityName === "")
        return;
    else{
    error.classList.remove("active");
    errorImage.classList.remove("active"); // Hide error image if it was previously shown
    fetchSearchWeatherInfo(cityName);
    }

});



const error = document.querySelector("[data-error]");
const errorImage = document.querySelector("[data-error-img]"); // Correctly select the error image element

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    error.classList.remove("active");
    errorImage.classList.remove("active")

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();
        loadingScreen.classList.remove("active");

        if (response.ok) {
            userInfoContainer.classList.add("active");
            renderWeatherInfo(data);
        } else {
            throw new Error("City not found");
        }
    } catch (err) {
        loadingScreen.classList.remove("active");
        // error.textContent = `Error: ${err.message}`;
        error.classList.add("active");
        errorImage.classList.add("active"); // Show the error image
    }
}