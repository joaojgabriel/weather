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
      C: data.current.temp_c,
      F: data.current.temp_f,
    },
    feel: {
      C: data.current.feelslike_c,
      F: data.current.feelslike_f,
    },
    wind: {
      mph: data.current.wind_mph,
      kph: data.current.wind_kph,
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

const logWeather = async (location) => console.log(await getWeather(location));

const logUserWeather = async () => logWeather(await getUserCity());

logUserWeather();

document.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault();
  if (document.querySelector("input").value) {
    logWeather(document.querySelector("input").value.trim());
  }
});
