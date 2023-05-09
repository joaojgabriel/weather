import "./style.css";

const getData = (url) => fetch(url, { mode: "cors" }).then((res) => res.json());

const getWeather = async (location) => {
  const data = await getData(
    `https://api.weatherapi.com/v1/current.json?key=8a3c2504ff81406191d14901230705&q=${location}&aqi=no`
  );

  if (data.error) return data.error.message;

  return {
    locationName: data.location.name,
    condition: data.current.condition.text,
    temp: {
      metric: data.current.temp_c,
      imperial: data.current.temp_f,
    },
    feel: {
      metric: data.current.feelslike_c,
      imperial: data.current.feelslike_f,
    },
    wind: {
      metric: data.current.wind_kph,
      imperial: data.current.wind_mph,
      degree: data.current.wind_degree,
    },
  };
};

const getUserCity = async () =>
  (
    await getData(
      `https://api.geoapify.com/v1/ipinfo?apiKey=152aeca885dd48eb94281c67f8967a60`
    )
  ).city.names.en;

const changeMode = (cb, data, mode) =>
  cb(data, mode === "metric" ? "imperial" : "metric");

const changeModeOnClick =
  (...elements) =>
  (cb, data, mode) =>
    elements.forEach((element) =>
      element.addEventListener("click", () => changeMode(cb, data, mode))
    );

const parseTemperature = (temp, mode) =>
  mode === "metric" ? `${temp}°C` : `${temp}°F`;

const displayWeather = async (data, mode) => {
  const article = document.createElement("article");

  const heading = document.createElement("h2");
  heading.textContent = data.locationName;
  article.appendChild(heading);

  const definitionList = document.createElement("dl");

  const temperatureTerm = document.createElement("dt");
  temperatureTerm.textContent = "Temperature";
  definitionList.appendChild(temperatureTerm);

  const temperatureValue = document.createElement("dd");
  temperatureValue.textContent = parseTemperature(data.temp[mode], mode);
  definitionList.appendChild(temperatureValue);

  const feelsLikeTerm = document.createElement("dt");
  feelsLikeTerm.textContent = "Feels like";
  definitionList.appendChild(feelsLikeTerm);

  const feelsLikeValue = document.createElement("dd");
  feelsLikeValue.textContent = data.feel[mode];
  definitionList.appendChild(feelsLikeValue);

  const windTerm = document.createElement("dt");
  windTerm.textContent = "Wind";
  definitionList.appendChild(windTerm);

  const windValue = document.createElement("dd");
  windValue.textContent = data.wind[mode];
  definitionList.appendChild(windValue);

  changeModeOnClick(temperatureValue, feelsLikeValue, windValue)(
    displayWeather,
    data,
    mode
  );

  article.appendChild(definitionList);

  document.body.appendChild(article);
};

const displayUserWeather = async () =>
  displayWeather(await getWeather(await getUserCity()), "metric");

displayUserWeather();

document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = document.querySelector("input").value;
  if (query) {
    displayWeather(await getWeather(query.trim()), "metric");
  }
});
