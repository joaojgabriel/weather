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
  const isMetric = system === "metric";
  switch (txt) {
    case "temp":
      return isMetric ? `${val}°C` : `${val}°F`;
    case "wind":
      return isMetric ? `${val}kph` : `${val}mph`;
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

const showWeather = ({ city, temp, feel, wind }, system) => {
  const oldArticle = document.querySelector("article");
  if (oldArticle) oldArticle.remove();

  const tempVal = create("dd", format("temp")(temp[system], system), "temp");
  const feelVal = create("dd", format("temp")(feel[system], system), "feel");
  const windVal = create("dd", format("wind")(wind[system], system), "wind");

  document.body.append(
    ...createStruct([
      "article",
      [
        ["h2", city],
        [
          "dl",
          [
            ["dt", "Temperature"],
            [tempVal],
            ["dt", "Feels like"],
            [feelVal],
            ["dt", "Wind"],
            [windVal],
          ],
        ],
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

document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = document.querySelector("input").value;
  if (query) {
    showWeather(await getWeather(query.trim()), "metric");
  }
});
