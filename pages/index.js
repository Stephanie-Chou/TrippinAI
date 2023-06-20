import Head from "next/head";
import { useState, useEffect, cache } from "react";
import { createParser } from "eventsource-parser";
import Day from "../components/Day";
import DayTrips from "../components/DayTrips";
import styles from "./index.module.css";

export default function Home() {
  const DEFAULT_INTERESTS = ["Food", "Off the Beaten Path", "Adventure", "History", "Culture"];

  //Form State
  const [cityInput, setCityInput] = useState("");
  const [locationName, setLocationName] = useState("");
  const [stream, setStream] = useState("");
  const [checkedState, setCheckedState] = useState(
    DEFAULT_INTERESTS.map((interest) => ({name: interest, isChecked: false}))
  );
  const [tripLength, setTripLength] = useState(3);

  // Itinerary Model State
  const [dayTrips, setDayTrips] = useState([]);
  const [meta, setMeta] = useState(); // array of activities and array of neighborhood names
  const [activities, setActivities] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [food, setFood] = useState([]);

  // States
  const [loading, setLoading] = useState({
    activities: false,
    dayTrips: false,
  });
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    fetchActivities(dayTrips)
  }, [dayTrips]);
  
  useEffect(() => {
    fetchActivityDescriptions(meta);
    fetchWalkingTours(meta);
    fetchFood(meta)
  }, [meta]);

  useEffect(() => {
    renderDays(activities, neighborhoods, food, tripLength);
  }, [activities, neighborhoods, food, tripLength])

  useEffect(() => {
  }, [errorMessages])

  /***********************
  * RENDER FUNCTIONS
  ************************/
  function renderLoader() {
    const {activities, dayTrips} = loading;
    return (activities || dayTrips) ? 
      <div>
        {activities ? "...Loading Activities" : null}
        {dayTrips ? " ...Loading Day Trips" : null}
        <div className={styles.ldsellipsis}><div></div><div></div><div></div><div></div></div>
      </div>: null;
  }

  function renderDays() {
    if (activities.length === 0) return;
    let subheader;
    let days = new Array(tripLength).fill(0);
    return days.map((day, i) => {
      subheader = "Day " + (i + 1);
      return (
        <Day
          activity={activities[i]}
          neighborhood={neighborhoods[i]}
          food={food[i]}
          subheader={subheader}
          locationName={locationName}
          key={i}
        />
      )
    })
  }

  /***********************
  * DATA FETCH FUNCTIONS
  ************************/
  const fetchDayTrips = cache(async () => {
      if (!cityInput) return;
      const response = await fetch("/api/generateDayTrip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ city: cityInput }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.statusText}`);
      }

      const data = response.body;
      if (!data) {
        return;
      }
      getStreamResponse(data).then((streamResponse) => {
        console.log(streamResponse);
        setDayTrips(JSON.parse(streamResponse).day_trips);
        setLoading((prev) => ({
          activities: prev.activities,
          dayTrips: false,
        }));
      });
  })

  /**
   * 
   * @returns Activities and Neighborhoods list.
   * {
      "activities": ["La Jolla Kayak Tour", "San Diego Zoo Safari Park", "USS Midway Museum"],
      "neighborhoods": ["La Jolla", "San Pasqual Valley", "Downtown San Diego"]
    }
   */
    async function fetchActivities() {
    if (!cityInput) return;
    const selectedInterests = checkedState.map((item) => item.isChecked? item.name : "").filter((n)=>n).join()
    console.log(`fetching with inputs  ${cityInput} days: ${tripLength}` )

    const response = await fetch("/api/generateActivity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ city: cityInput, interests: selectedInterests, tripLength: tripLength }),
    });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.statusText}`);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }
    getStreamResponse(data).then((streamResponse) => {
      const json = jsonParse(streamResponse);

      console.log(streamResponse);
      if (!json) return;

      if (json.error) {
        setErrorMessages(errorMessages.push(json.error));
        return;
      }

      setMeta(json);
      setActivities(json.activities.map((activity) => {
        return {
          name: activity,
          short_desc: "",
          long_desc: "",
        }
      }));

      setNeighborhoods(json.neighborhoods.map((neighborhood) => {
        return {
          name: neighborhood,
          walking_tour: []
        }
      }));
      setLoading((prev) => ({
        activities: false,
        dayTrips: prev.dayTrips,
      }));
      setCityInput(""); // clear it so it rerenders don't refetch activities.
    });
  }

  async function fetchFood() {
    for (let i = 0; i< neighborhoods.length; i++) {
      fetchOneFoods(neighborhoods[i], i)
    }
  }

  /**
   * 
   * @param {*} neighborhood 
   * @param {*} index 
   * @returns 
   *   food: {
      "lunch": {"name": "Pike Place Chowder", "desc": "Indulge in delicious and hearty chowders featuring fresh local ingredients."},
      "dinner": {"name": "Matt's in the Market", "desc": "Enjoy seasonal and locally sourced dishes in a cozy setting above Pike Place Market."}
  }
   */

  async function fetchOneFoods(neighborhood, index) {
    const response = await fetch("/api/generateFood", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ location: neighborhood.name}),
    });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.statusText}`);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    getStreamResponse(data).then((streamResponse) => {
      const json = jsonParse(streamResponse);
      if (!json) return;

      if (json.error) {
        setErrorMessages(errorMessages.push(json.error));
        return;
      }
      let updatedFood = food;
      updatedFood[index] = json;
      setFood(updatedFood);
    });
  }

  async function fetchActivityDescriptions() {
    for (let i = 0; i< activities.length; i++) {
      fetchActivityDescription(activities[i], i)
    }
  }

  async function fetchActivityDescription(activity, index) {
    const response = await fetch("/api/generateActivityDescription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ location: activity.name, city: cityInput}),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.statusText}`);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    getStreamResponse(data).then((streamResponse) => {
      let updatedActivities = activities;
      const json = jsonParse(streamResponse);
      if (!json) return;

      if (json.error) {
        setErrorMessages(errorMessages.push(json.error));
        return;
      }

      updatedActivities[index].long_desc = json.long_desc;
      updatedActivities[index].short_desc = json.short_desc;
      setActivities(updatedActivities);
    });
  }

  function fetchWalkingTours() {    
    for (let i = 0; i< neighborhoods.length; i++) {
      fetchWalkingTour(neighborhoods[i], i)
    }
  }

  /**
   * 
   * @param {*} neighborhood 
   * @param {*} index 
   * @returns 
   *  [ 
        {"name": "Flatiron Building", "desc": "Admire the iconic triangular building, a National Historic Landmark and a symbol of New York City."},
        {"name": "Madison Square Park", "desc": "Relax in the park, surrounded by iconic skyscrapers, and enjoy the seasonal art installations."},
        {"name": "Eataly Flatiron", "desc": "Explore this Italian food emporium, offering delicious gourmet food, coffee, and pastries."}
     ]
   */
  async function fetchWalkingTour(neighborhood, index) {
    console.log(`fetch walking tour for ${neighborhood.name}`);
    const response = await fetch("/api/generateWalkingTour", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ neighborhood: neighborhood.name}),
    });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.statusText}`);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    fetchImage(neighborhood, index);
    getStreamResponse(data).then((streamResponse) => {
      const json = jsonParse(streamResponse);
      if (!json) return;
      
      let updatedNeighborhoods = neighborhoods;
      updatedNeighborhoods[index].walking_tour = json;
      setNeighborhoods(updatedNeighborhoods);
    });
  }

  async function fetchImage(neighborhood, index) {
    if (!neighborhoods || neighborhoods.length === 0) return;
    console.log(`fetch image for ${neighborhood.name}`);
    try {
      const response = await fetch("/api/fetchUnsplashImage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ locationName, neighborhood: neighborhood.name })
    });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      let updatedNeighborhoods = neighborhoods;
      updatedNeighborhoods[index].image = data.images[0];
      setNeighborhoods(updatedNeighborhoods);
    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }
  function initializeItineraryStates() {
    const initActivities = Array.from({length: tripLength}, () => ({
      name:"",
      short_desc:"",
      long_desc:"",
      image: {}
    }));

    const initNeighborhoods = Array.from({length: tripLength}, () => ({
      name: "",
      walking_tour: [],
      image: {}
    }));

    const initFood = Array.from({length: tripLength}, () => ({
      lunch: {name:"", desc:""},
      dinner: {name:"", desc:""}
    }));
    setActivities(initActivities);
    setNeighborhoods(initNeighborhoods);
    setFood(initFood)
  }
  /*****************
  * UTIL FUNCTIONS
  ******************/

  function jsonParse(jsonString) {
    try {
      const json = JSON.parse(jsonString);

      if (json.error) {
        setErrorMessages(errorMessages.push(json.error));
        return;
      }

      return json;
    } catch (e){
      throw new Error(`${e} Tried to Parse: ${jsonString}`);
    }
  }

  async function getStreamResponse(data) {
    let streamResponse = ""; // for the data to serve
    let streamResponseRender = ""; // for the rendering. this gets cut off
    const onParse = (event) => {
      if (event.type === "event") {
        const data = event.data;
        try {
          const text = JSON.parse(data).text ?? "";
          streamResponse+= text;
          streamResponseRender+= text;
          setStream(streamResponseRender);
          if (streamResponseRender.length > 300) {
            streamResponseRender="";
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    // https://web.dev/streams/#the-getreader-and-read-methods
    const reader = data.getReader();
    const decoder = new TextDecoder();
    const parser = createParser(onParse);
    let done = false;
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      parser.feed(chunkValue);
    }

    setStream("");
    return streamResponse;
  }

  /*****************
  * FORM FUNCTIONS
  ******************/

  async function onSubmit(event) {
    setLoading({
      activities:true,
      dayTrips: true,
    });
    event.preventDefault();

    initializeItineraryStates();
    fetchDayTrips();
  }

  const handleOnChange = (position) => {
    const updatedCheckedState = checkedState.map((item, index) =>
      index === position ? {name: item.name, isChecked: !item.isChecked} : item
    );
    setCheckedState(updatedCheckedState)
  }

  return (
    <div>
      <Head>
        <title>Trippin - The AI Powered Travel Planner</title>
        <link rel="icon" href="/JourneyGenieLogo_thick.png" />
      </Head>

      <main className={styles.main}>
        <div className={styles.hero}>
          <div className={styles.input}>
            <img src="/JourneyGenieLogo_thick.png" className={styles.icon} />
            <h1>TRIPPIN</h1>
            <h4> The AI Powered Travel Planner </h4>
            <form onSubmit={onSubmit}>
              <input
                type="text"
                name="city"
                placeholder="Tell me where you are going (city)"
                value={cityInput}
                onChange={(e) => {
                  setCityInput(e.target.value);
                  setLocationName(e.target.value);
                }}
              />

              <div className={styles.select}>
                <label forhtml="tripLength">How long are you there?</label>
                <select 
                  name="tripLength" 
                  id="tripLength"
                  defaultValue={tripLength}
                  onChange={(e) => setTripLength(parseInt(e.target.value))}
                >
                  <option value="1">1 Day</option>
                  <option value="2">2 Days</option>
                  <option value="3">3 Days</option>
                  <option value="4">4 Days</option>
                  <option value="5">5 Days</option>
                </select>
              </div>


              <p>Why are you traveling?</p>
              <div className={styles.checkboxes}> 
                {
                  DEFAULT_INTERESTS.map((interest, index) => {
                    return (
                      <div key={index}>
                        <input
                          type="checkbox"
                          id={`interest-checkbox-${index}`}
                          name={interest}
                          value={interest}
                          checked={checkedState[index].isChecked}
                          onChange={() => handleOnChange(index)
                        }/>
                        <label htmlFor={`interest-checkbox-${index}`}>{interest}</label>
                      </div>
                      
                    )
                  })
                }
              </div>
              <input type="submit" value="Plan It" />
            </form>
            {errorMessages.join(', ')}
            {renderLoader()}
          </div>
        </div>
                
        <div className={styles.result}>
          <div className={styles.stream}>{stream}</div>
          {locationName ? <h4>Travel Plan for <span className={styles.cityName}> {locationName} </span></h4> : ""}
          {renderDays()}
          <DayTrips
            dayTrips={dayTrips}
            locationName={locationName}
          />
        </div>
      </main>
    </div>
  );
}
