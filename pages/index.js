import Head from "next/head";
import { useState, useEffect, use } from "react";
import styles from "./index.module.css";
import {
  createParser,
} from "eventsource-parser";

import Page from "../components/Page";
import Itinerary from "../components/Itinerary";

export default function Home() {
  const [cityInput, setCityInput] = useState("");
  const [locationName, setLocationName] = useState("");
  const [dayTrips, setDayTrips] = useState([]);
  const [activities, setActivities] = useState([]);
  const [stream, setStream] = useState("");
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
        {activities ? "Loading Activities " : null}
        {dayTrips ? "Loading Day Trips" : null}
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
            <h2> {day.site}</h2>
            {day.long_desc}
          </Page>

          <Page
            header={locationName}
            subheader={subheader}
          >
            <h2> {day.neighborhood} Walking Tour</h2>
            {renderWalkingTourLong(day.walking_tour)}
          </Page>
        </>
      )
    });
  }

  function renderDayTripItinerary() {
    if (!dayTrips) return;

    return dayTrips.map((trip) => {
      return (
        <Page
          header={locationName}
          subheader="Day Trip"
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
      setActivities(JSON.parse(streamResponse).activities);
      setLoading((prev) => ({
        activities: false,
        dayTrips: prev.dayTrips,
      }));
      setCityInput(""); // clear it so it rerenders don't refetch activities.
    });
  }

  async function fetchSiteDescriptions(activities) {
    for (let i = 0; i< activities.length; i++) {
      fetchSiteDescription(activities[i])
    }
  }
  function fetchWalkingTours(activities) {    
    for (let i = 0; i< activities.length; i++) {
      fetchWalkingTour(activities[i])
    }
  }

  async function fetchSiteDescription(activity) {
    const response = await fetch("/api/generateSiteDescription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ location: activity.site }),
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
      updatedActivities[activity.day-1].long_desc = JSON.parse(streamResponse);
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
    let streamResponse = "";
    const onParse = (event) => {
      if (event.type === "event") {
        const data = event.data;
        try {
          const text = JSON.parse(data).text ?? "";
          streamResponse+= text;
          setStream(streamResponse);
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

  return (
    <div>
      <Head>
        <title>Trip Planner</title>
      </Head>

      <main className={styles.main}>
        <div className={styles.input}>
          <h3>Trip Planner 1.0 - {cityInput}</h3>
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
            <input type="submit" value="Plan it for Me" />
          </form>
          {renderLoader()}
        </div>
        <div className={styles.result}>
          <div className={styles.stream}>{stream}</div>
          {renderDays()}
          {renderDayTripItinerary()}
        </div>
      </main>
    </div>
  );
}
