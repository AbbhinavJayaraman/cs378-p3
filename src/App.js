import { useState, useEffect } from 'react';
import './App.css';

// Ex: https://api.open-meteo.com/v1/forecast?latitude=30.27&longitude=-97.74&hourly=temperature_2m,relativehumidity_2m,apparent_temperature,precipitation_probability,pressure_msl,surface_pressure,cloudcover,visibility,windspeed_10m,soil_temperature_0cm,soil_moisture_0_1cm&timezone=America%2FChicago
// The configured parameters have the 
const BASE_URL = "https://api.open-meteo.com/v1/forecast?latitude=LAT&longitude=LONG&daily=apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_hours,windspeed_10m_max,winddirection_10m_dominant,shortwave_radiation_sum&timezone=America%2FChicago"
const AUSTIN = "30.27, -97.74" //35.00, -91.98
const DATA_KEYS = ['apparent_temperature_max', 'apparent_temperature_min', 'sunrise', 'sunset', 'uv_index_max', 'precipitation_sum', 'precipitation_hours', 'windspeed_10m_max', 'winddirection_10m_dominant', 'shortwave_radiation_sum']
const DATA_UNITS = {"apparent_temperature_max":"°C","apparent_temperature_min":"°C","sunrise":"","sunset":"","uv_index_max":"","precipitation_sum":"mm","precipitation_hours":"h","windspeed_10m_max":"km/h","winddirection_10m_dominant":"°","shortwave_radiation_sum":"MJ/m²"}

const DATA_TEXTS = {"apparent_temperature_max":"Feels Like Max Temp: ","apparent_temperature_min":"Feels Like Min Temp: ","sunrise":"Sunrise: ","sunset":"Sunset: ","uv_index_max":"UV Index: ","precipitation_sum":"Total Precipitation: ","precipitation_hours":"Precipitation Duration: ","windspeed_10m_max":"Max Windspeed: ","winddirection_10m_dominant":"Wind Direction: ","shortwave_radiation_sum":"Total Shortwave Radiation: "}
/*
(<>
        <div className='temp_max'>Feels Like Max Temp: {daily['apparent_temperature_max'][0]} {daily_units['apparent_temperature_max']}</div>
        <div className='temp_min'>Feels Like Min Temp: {daily['apparent_temperature_min'][0]} {daily_units['apparent_temperature_min']}</div>
        <div className='sun_rise'>Sunrise: {daily['sunrise'][0]}</div>
        <div className='sun_set'>Sunset: {daily['sunset'][0]}</div>
        <div className='uv'>UV Index: {daily['uv_index_max'][0]} {daily_units['uv_index_max']}</div>
        <div className='precip'>Total Precipitation: {daily['precipitation_sum'][0]} {daily_units['precipitation_sum']}</div>
        <div className='precip_time'>Precipitation Duration: {daily['precipitation_hours'][0]} {daily_units['precipitation_hours']}</div>
        <div className='wind_speed'>Max Windspeed: {daily['windspeed_10m_max'][0]}{daily_units['windspeed_10m_max']}</div>
        <div className='wind_dir'>Wind Direction: {daily['winddirection_10m_dominant'][0]} {daily_units['winddirection_10m_dominant']}</div>
        <div className='rads'>Total Shortwave Radiation: {daily['shortwave_radiation_sum'][0]} {daily_units['shortwave_radiation_sum']}</div>
      </>)
*/

function App() {
  
  const [search, setSearch] = useState("");
  const [curLoc, setCurLoc] = useState(AUSTIN);
  const [locs, setLocs] = useState([AUSTIN]);
  const [weatherDatas, setWeatherDatas] = useState([]);

  const showTheWeather = (key) => {

    if (weatherDatas.length === 0 || weatherDatas[curLoc] === undefined) {
      console.log("No data yet...")
      return <div key={key} className={"daily-stat"}>loading...</div>
    }
    return <div key={key} className={"daily-stat"}>
      <div className={"col text"}>{DATA_TEXTS[key]}</div>
      <div className={"col data"}>{weatherDatas[curLoc][key][0]}{DATA_UNITS[key]}</div>
    </div>
  }
  
  const getWeatherData = async (latlong) => {
    // gotta specify input format, easy place for user error.
    let nums = latlong.split(', ')
    if (nums.length !== 2) {
      console.log("What the user typed in : " + nums)
      alert("Please type in the longitude and latitude as specified")
      return;
    }
    setCurLoc(latlong)
    let lat = nums[0]
    let long = nums[1]
    let url = (BASE_URL.replace("LAT", lat)).replace("LONG", long)
    let json = null
    try {
      const response = await fetch(url)
      json = await response.json()
      //src https://javascript.plainenglish.io/how-to-add-to-an-array-in-react-state-3d08ddb2e1dc
      if (!locs.includes(latlong)) {
        setLocs((list) => [...list, latlong]);
        console.log("added new thing")
      }
      let daily = json["daily"]
      console.log(daily)
      let rise = (daily["sunrise"][0].replace("T0", " "))
      let set = (daily["sunset"][0].replace("T1", " "))
      daily["sunrise"][0] = rise
      daily["sunset"][0] = set
      setWeatherDatas({...weatherDatas, [latlong]:daily})
      //console.log(weatherDatas)
    }
    catch (err) {
      console.log(err)
      alert("Error retrieving data, woohoo I'm quirky")
    }
    finally {
      //console.log(json)
      setSearch("")
    }
  }

  // Supposed to give me some initial data?
  useEffect(() => {
    getWeatherData(AUSTIN);
  }, []);
  
  return (
    <div className="App">
      <header className="App-header">
        <h1> The Extra Weather App</h1>
        <em> The weather app, that is sooo extra</em>
        <p> Enter Longitude, Latitude <br></br>
          (Example Input, don't use quotes: "30.27, -97.74")
        </p>
        <div className={"Search-Bar"}>
          <input value={search} onChange={(event) => setSearch(event.target.value)} type={"text"} />
          <button onClick={() => getWeatherData(search)}>+</button>
        </div>
        {locs.map((loc, i) => (
            <button
              className={`Location ${loc === curLoc ? "Current" : ""}`}
              key={i} //apparently need keys to make sure React can see what's updated in a list, source https://stackoverflow.com/questions/65066607/what-is-the-difference-between-key-and-id-in-react-component
              onClick={() => getWeatherData(loc)}
            >{loc}</button>
        ))}
        <div><br></br></div>
        <div 
          className={"row"}
          key={"weather"}>{DATA_KEYS.map((key) => (showTheWeather(key)))}
        </div>
      </header>
    </div>
  );
}

export default App;
