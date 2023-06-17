import Head from "next/head";
import { useState, useEffect } from "react";
import styles from "./index.module.css";
import {
  createParser,
} from "eventsource-parser";

export default function Home() {
  const [cityInput, setCityInput] = useState("");
  const [dayTrips, setDayTrips] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState({
    activities: false,
    dayTrips: false,
  });

  useEffect(() => {fetchWalkingTours(activities)}, [activities])
  
  function renderLoader() {
    const {activities, dayTrips} = loading;
    return (activities || dayTrips) ? 
      <div>
        <div className={styles.ldsellipsis}><div></div><div></div><div></div><div></div></div>
        {activities ? "Loading Activities " : null}
        {dayTrips ? "Loading Day Trips" : null}
      </div>: null;
  }

  function renderWalkingTourShort(tour) {
    if (!tour) return null;
    console.log('short tour ', tour);

    return tour.map((step) => {
      return <li>{step.name}</li>
    });
  }

  function renderWalkingTourLong(neighborhood, tour) {
    if (!tour) return null;
    return (
      <div>
        {tour.map((step) => <li>{step.name}: {step.desc}</li>)}
      </div>
    );
  }

  function renderDayItineraries() {
    if (!activities) return;
    return activities.map((day) => {
      return (
        <div>
          <div className={styles.itineraryPage}>
            <div className={styles.header}>
            <div className={styles.tag}>
              <div className={styles.tagHeader}>{cityInput}</div>
              <div className={styles.tagSubheader}>Day {day.day}</div>
            </div>
            </div>
            <div className={styles.container}>
              <table>
                <tr>
                  <th> Date and Location </th>
                  <th> Description </th>
                </tr>
                <tr>
                  <td>{day.site}</td>
                  <td>{day.short_desc}</td>
                </tr>
                <tr>
                  <td> <div>Lunch</div> {day.food.lunch.name}</td>
                  <td>{day.food.lunch.desc}</td>
                </tr>
                <tr>
                  <td>Walking tour of {day.neighborhood}</td>
                  <td>
                    <ol>{renderWalkingTourShort(day.walking_tour)}</ol>
                  </td>
                </tr>
                <tr>
                  <td> <div>Dinner</div> {day.food.dinner.name}</td>
                  <td>{day.food.dinner.desc}</td>
                </tr>
              </table>

              <h2> {neighborhood} Walking Tour</h2>
              {day.long_desc}
              {renderWalkingTourLong(day.neighborhood, day.walking_tour)}
            </div>
          </div>
        </div>
      )
    });
  }

  function renderDayTripItinerary() {
    if (!dayTrips) return;

    return dayTrips.map((trip) => {
      return (
        <div className={styles.itineraryPage}>
          <div className={styles.header}>
            <div className={styles.tag}>
              <div className={styles.tagHeader}>{cityInput}</div>
              <div className={styles.tagSubheader}>Day Trip</div>
            </div>
          </div>
          <div className={styles.container}>
            <h1>{trip.name}</h1>
            <div className={styles.longDescription}>{trip.long_desc}</div>
            <table>
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
            </table>
          </div>
        </div>
      )
    })

  }

  async function fetchDayTrips() {
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
     });
  }

  function fetchWalkingTours(activities) {
      activities.forEach((activity) => {
        fetchWalkingTour(activity)
      })
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
      console.log('updated activities ', neighborhood, updatedActivities);
      setActivities(updatedActivities);
    });

  }

  async function onSubmit(event) {
    setLoading({
      activities:true,
      dayTrips: true,
    });
    event.preventDefault();
    fetchActivities();
    // fetchDayTrips();
  }

  async function getStreamResponse(data) {
    let streamResponse = "";
    const onParse = (event) => {
      if (event.type === "event") {
        const data = event.data;
        try {
          const text = JSON.parse(data).text ?? "";
          streamResponse+= text;
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
              onChange={(e) => setCityInput(e.target.value)}
            />
            <input type="submit" value="Plan it for Me" />
          </form>
          {renderLoader()}
        </div>
        <div className={styles.result}>
          {renderDayItineraries()}
          {renderDayTripItinerary()}
        </div>
      </main>
    </div>
  );
}
