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

const changeSystem = (cb, data, sys) =>
  cb(data, sys === "metric" ? "imperial" : "metric");

const changeSystemOnClick =
  (...elements) =>
  (cb, data, sys) =>
    elements.forEach((element) =>
      element.addEventListener("click", () => changeSystem(cb, data, sys))
    );

const format = (txt) => (val, mode) => {
  const isMetric = mode === "metric";
  switch (txt) {
    case "temp":
      return isMetric ? `${val}°C` : `${val}°F`;
    case "wind":
      return isMetric ? `${val}kph` : `${val}mph`;
    default:
  }
};

const displayWeather = async ({ locationName, temp, feel, wind }, sys) => {
  const article = document.createElement("article");

  const heading = document.createElement("h2");
  heading.textContent = locationName;
  article.appendChild(heading);

  const definitionList = document.createElement("dl");

  const tempTerm = document.createElement("dt");
  tempTerm.textContent = "Temperature";
  definitionList.appendChild(tempTerm);

  const tempValue = document.createElement("dd");
  tempValue.textContent = format("temp")(temp[sys], sys);
  definitionList.appendChild(tempValue);

  const feelTerm = document.createElement("dt");
  feelTerm.textContent = "Feels like";
  definitionList.appendChild(feelTerm);

  const feelValue = document.createElement("dd");
  feelValue.textContent = format("temp")(feel[sys], sys);
  definitionList.appendChild(feelValue);

  const windTerm = document.createElement("dt");
  windTerm.textContent = "Wind";
  definitionList.appendChild(windTerm);

  const windValue = document.createElement("dd");
  windValue.textContent = format("wind")(wind[sys], sys);
  definitionList.appendChild(windValue);

  changeSystemOnClick(tempValue, feelValue, windValue)(
    displayWeather,
    { locationName, temp, feel, wind },
    sys
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
