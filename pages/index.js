import Head from "next/head";
import { useState, useEffect, use } from "react";
import styles from "./index.module.css";

import {
  createParser,
} from "eventsource-parser";

import Page from "../components/Page";
import Itinerary from "../components/Itinerary";

export default function Home() {
  const interests = ["Food", "Off the beaten path", "Adventure", "History"];

  const [cityInput, setCityInput] = useState("");
  const [locationName, setLocationName] = useState("");
  const [dayTrips, setDayTrips] = useState([]);
  const [activities, setActivities] = useState([]);
  const [stream, setStream] = useState("");
  const [checkedState, setCheckedState] = useState(
    interests.map((interest) => ({name: interest, isChecked: false}))
);
  const [loading, setLoading] = useState({
    activities: false,
    dayTrips: false,
  });

  useEffect(() => {
    fetchActivities(dayTrips)
  }, [dayTrips]);
  useEffect(() => {
    fetchWalkingTours(activities);
    fetchSiteDescriptions(activities);
  }, [activities]);
  
  function renderLoader() {
    const {activities, dayTrips} = loading;
    return (activities || dayTrips) ? 
      <div>
        <div className={styles.ldsellipsis}><div></div><div></div><div></div><div></div></div>
        {activities ? "...Loading Activities" : null}
        {dayTrips ? " ...Loading Day Trips" : null}
      </div>: null;
  }

  function renderWalkingTourLong(tour) {
    if (!tour) return null;
    return (
      <ol>
        {tour.map((step) => <li key={step.name}>{step.name}: {step.desc}</li>)}
      </ol>
    );
  }

  function renderDays() {
    if (!activities) return;
    let subheader;
    return activities.map((day) => {
      subheader = "Day " + day.day;
      return (
        <>
          <Page
            header={locationName}
            subheader={subheader}
          >
            <Itinerary day={day}/>
          </Page>
          
          <Page
            header={locationName}
            subheader={subheader}
          >
            <h3> {day.site}</h3>
            {day.long_desc}
          </Page>

          <Page
            header={locationName}
            subheader={subheader}
          >
            <h3> {day.neighborhood} Walking Tour</h3>
            {renderWalkingTourLong(day.walking_tour)}
          </Page>
        </>
      )
    });
  }

  function renderDayTripItinerary() {
    if (!dayTrips) return;

    return dayTrips.map((trip, index) => {
      return (
        <Page
          header={locationName}
          subheader="Day Trip"
          id={index}
        >
          <h1>{trip.name}</h1>
            <div className={styles.longDescription}>{trip.long_desc}</div>
            <table>
              <tbody>
                <tr>
                  <th> Date and Location </th>
                  <th> Description </th>
                </tr>
                <tr>
                  <td>Morning Travel</td>
                  <td>Travel to {trip.name}</td>
                </tr>
                <tr>
                  <td>{trip.name}</td>
                  <td>{trip.short_desc}</td>
                </tr>
                <tr>
                  <td>Eat at {trip.food.name}</td>
                  <td>{trip.food.desc}</td>
                </tr>
              </tbody>
            </table>
        </Page>     
      )
    })

  }

  async function fetchDayTrips() {
      if (!cityInput) return;
      const response = await fetch("/api/generateDayTrip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        setDayTrips(JSON.parse(streamResponse).day_trips);
        setLoading((prev) => ({
          activities: prev.activities,
          dayTrips: false,
        }));
      });
  }

  async function fetchActivities() {
    if (!cityInput) return;
    const response = await fetch("/api/generateActivity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ city: cityInput }),
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
      console.log('activities ', streamResponse)
      setActivities(JSON.parse(streamResponse).activities);
      setLoading((prev) => ({
        activities: false,
        dayTrips: prev.dayTrips,
      }));
      setCityInput(""); // clear it so it rerenders don't refetch activities.
    });
  }

  async function fetchSiteDescriptions(activities) {
    const interests = checkedState.map((item) => item.isChecked? item.name : "").filter((n)=>n).join()

    for (let i = 0; i< activities.length; i++) {
      fetchSiteDescription(activities[i], interests)
    }
  }
  function fetchWalkingTours(activities) {    
    for (let i = 0; i< activities.length; i++) {
      fetchWalkingTour(activities[i])
    }
  }

  async function fetchSiteDescription(activity, interests) {
    const response = await fetch("/api/generateSiteDescription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ location: activity.site, interests: interests }),
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
      console.log('description ', streamResponse);
      updatedActivities[activity.day-1].long_desc = streamResponse;
      setActivities(updatedActivities);
    });
  }

  async function fetchWalkingTour(activity) {
    let neighborhood = activity.neighborhood;
    let tourStops = activity.walking_tour.map((stop) => stop.name);

    const response = await fetch("/api/generateWalkingTour", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ neighborhood, tourStops }),
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
      updatedActivities[activity.day-1].walking_tour = JSON.parse(streamResponse);
      setActivities(updatedActivities);
    });
  }

  async function onSubmit(event) {
    setLoading({
      activities:true,
      dayTrips: true,
    });
    event.preventDefault();
    fetchDayTrips();
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

  const handleOnChange = (position) => {
    const updatedCheckedState = checkedState.map((item, index) =>
      index === position ? {name: item.name, isChecked: !item.isChecked} : item
    );

    setCheckedState(updatedCheckedState)
  }
  return (
    <div>
      <Head>
        <title>JourneyGenie - The AI Powered Travel Planner</title>
        <link rel="icon" href="/JourneyGenieLogo_thick.png" />
      </Head>

      <main className={styles.main}>
        <div className={styles.hero}>
          <div className={styles.input}>
            <img src="/JourneyGenieLogo_thick.png" className={styles.icon} />
            <h2>JourneyGenie</h2>
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
              <p>Any particular Interests?</p>
              <div className={styles.checkboxes}> 
                {
                  interests.map((interest, index) => {
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
              <input type="submit" value="Plan it for Me" />
            </form>
            {renderLoader()}
          </div>
        </div>
                
        <div className={styles.result}>
          <div className={styles.stream}>{stream}</div>
          {locationName ? <h4>Travel Plan for <span className={styles.cityName}> {locationName} </span></h4> : ""}
          {renderDays()}
          {renderDayTripItinerary()}
        </div>
      </main>
    </div>
  );
}
