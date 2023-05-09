import "./style.css";

const getData = (url) =>
  fetch(url, { mode: "cors" })
    .then((res) => res.json())
    .catch((err) => {
      throw new Error(err);
    });

const getWeather = async (location) => {
  try {
    const data = await getData(
      `https://api.weatherapi.com/v1/current.json?key=8a3c2504ff81406191d14901230705&q=${location.trim()}&aqi=no`
    );

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
  } catch (err) {
    console.error(err);
  }
};

const logWeather = async (location) => console.log(await getWeather(location));

logWeather("   New York  ");
