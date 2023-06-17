import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";
import {
  createParser,
} from "eventsource-parser";

export default function Home() {
  const [cityInput, setCityInput] = useState("");
  const [dayTrips, setDayTrips] = useState();
  const [activities, setActivities] = useState();
  const [stream, setStream] = useState("");

  function renderWalkingTourShort(tour) {
    return tour.map((step) => {
      return <li>{step.name}</li>
    });
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
      console.log('fetch day trips');
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

     // This data is a ReadableStream
     const data = response.body;
     if (!data) {
       return;
     }
     let streamResponse = "";
      const onParse = (event) => {
        if (event.type === "event") {
          const data = event.data;
          try {
            const text = JSON.parse(data).text ?? "";
            streamResponse+= text;
            setStream((prev) => prev + text);
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

      if (done){
        setDayTrips(JSON.parse(streamResponse).day_trips);
      }

  }

  async function fetchActivities() {
      console.log('fetch activities');
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
     let streamResponse = "";
      const onParse = (event) => {
        if (event.type === "event") {
          const data = event.data;
          try {
            const text = JSON.parse(data).text ?? "";
            streamResponse+= text;
            setStream((prev) => prev + text);
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

      if (done){
        setActivities(JSON.parse(streamResponse).activities);
      }
      
  }
  async function onSubmit(event) {
    event.preventDefault();
    fetchActivities();
    // fetchDayTrips();
  }

  return (
    <div>
      <Head>
        <title>OpenAI Quickstart</title>
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
        </div>
        <div className={styles.result}>
          streamed {stream}
          {renderDayItineraries()}
          {renderDayTripItinerary()}
        </div>
      </main>
    </div>
  );
}
