import "./style.css";

const getData = (url) => fetch(url, { mode: "cors" }).then((res) => res.json());

const getWeather = async (location) => {
  const data = await getData(
    `https://api.weatherapi.com/v1/current.json?key=8a3c2504ff81406191d14901230705&q=${location}&aqi=no`
  );

  if (data.error) return data.error.message;

  return {
    city: data.location.name,
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
    },
  };
};

const getUserCity = async () =>
  (
    await getData(
      `https://api.geoapify.com/v1/ipinfo?apiKey=152aeca885dd48eb94281c67f8967a60`
    )
  ).city.names.en;

const changeSystem = (cb, data, system) =>
  cb(data, system === "metric" ? "imperial" : "metric");

const changeSystemOnClick =
  (...elements) =>
  (cb, data, system) =>
    elements.forEach((element) =>
      element.addEventListener("click", () => changeSystem(cb, data, system))
    );

const format = (txt) => (val, system) => {
  switch (txt) {
    case "temp":
      return system === "metric" ? `${val}°C` : `${val}°F`;
    case "wind":
      return system === "metric" ? `${val}kph` : `${val}mph`;
    default:
      return "";
  }
};

const create = (el, txt, ...classes) => {
  if (el instanceof Node) return el;

  const element = document.createElement(el);

  if (txt) element.textContent = txt;
  if (classes) classes.forEach((c) => element.classList.add(c));

  return element;
};

const createStruct = (...elements) =>
  elements.map((el) => {
    if (el instanceof Node) return el;
    if (Array.isArray(el)) {
      if (el[0] instanceof Node) return el[0];

      if (el[1] && typeof el[1] === "string") return create(...el);

      const parent = Array.isArray(el[0]) ? create(...el[0]) : create(el[0]);
      parent.append(...createStruct(...el[1]));
      return parent;
    }
    return create(el);
  });

const load = () => {
  if (document.querySelector(".loading")) {
    document.querySelector(".loading").remove();
  }

  if (document.querySelector(".weather")) {
    document.querySelector(".weather").remove();
  }

  document.body.append(
    ...createStruct(["article", [["p", "Loading...", "loading"]]])
  );
};

const showWeather = async ({ city, condition, temp, feel, wind }, system) => {
  load();

  const gifData = await getData(
    `https://api.giphy.com/v1/gifs/translate?api_key=EJ5mLTdeAdWwx7wckwHCGwzbDLmU0HDR&s=${condition}`
  );
  document.querySelector(".loading").remove();
  const gif = create("img");
  gif.src = gifData.data.images.original.url;

  const tempVal = create("dd", format("temp")(temp[system], system), "temp");
  const feelVal = create("dd", format("temp")(feel[system], system), "feel");
  const windVal = create("dd", format("wind")(wind[system], system), "wind");

  document.body.append(
    ...createStruct([
      ["article", "", "weather"],
      [
        ["h2", city],
        [
          "dl",
          [
            ["dt", "Temperature"],
            tempVal,
            ["dt", "Feels like"],
            feelVal,
            ["dt", "Wind"],
            windVal,
          ],
        ],
        gif,
      ],
    ])
  );

  changeSystemOnClick(tempVal, feelVal, windVal)(
    showWeather,
    { city, temp, feel, wind },
    system
  );
};

const showUserWeather = async () =>
  showWeather(await getWeather(await getUserCity()), "metric");

showUserWeather();

window.onload = load;

document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = document.querySelector("input").value;
  if (query) {
    load();
    showWeather(await getWeather(query.trim()), "metric");
  }
});
