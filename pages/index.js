import Head from "next/head";
import { useState, useEffect } from "react";
import styles from "./index.module.css";
import {
  createParser,
} from "eventsource-parser";

import Page from "./Page";
import Itinerary from "./Itinerary";

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

  function renderWalkingTourLong(tour) {
    if (!tour) return null;
    return (
      <ol>
        {tour.map((step) => <li>{step.name}: {step.desc}</li>)}
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
            header={cityInput}
            subheader={subheader}
          >
            <Itinerary day={day}/>
          </Page>
          
          <Page
            header={cityInput}
            subheader={subheader}
          >
            <h2> {day.site}</h2>
            {day.long_desc}
          </Page>

          <Page
            header={cityInput}
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
          header={cityInput}
          subheader="Day Trip"
        >
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
        </Page>     
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
/*
    let sampleResponse = [{
        "day":"1",
        "neighborhood": "Dinard",
        "site": "Pointe du Moulinet",
        "short_desc":"Iconic Dinard landmark known for its stunning views.",
        "long_desc": "Pointe du Moulinet is one of Dinard's most popular attractions, offering stunning views of the Emerald Coast and a dramatic promontory that stretches out into the sea. Take a stroll along the boardwalk and admire the picturesque landscape with its white-sand beaches and crystal-clear waters.",
        "walking_tour":[
          {"name": "Les Planches Promenade", "desc": ""},
          {"name": "Dinard Casino", "desc": ""},
          {"name": "Villa Maria", "desc": ""}
        ],
        "food": {
          "lunch": {
            "name":  "Le Grand Bleu",
            "desc": "Taste fresh seafood specialties, such as moules marinières, in an elegant setting with stunning views."
          },
          "dinner": {
            "name":  "La Verrière",
            "desc": "Enjoy classic French cuisine with a twist in a cozy atmosphere."
          }
        }
      },
      {
        "day":"2",
        "neighborhood": "St Malo",
        "site": "St Malo Old Town",
        "short_desc": "Dramatic fortified city with cobblestone streets and picturesque views.",
        "long_desc": "Explore the historic streets of St Malo's old town, a walled city filled with cobblestone lanes and picturesque views of the sea. Visit the iconic Grand Bé, an ancient fortress with a rich history, and marvel at the impressive ramparts that encircle the old town.",
        "walking_tour": [
          {"name": "Château de St Malo", "desc": ""},
          {"name": "Cathedral of St Vincent", "desc": ""},
          {"name": "Grand Bé", "desc": ""}
        ],
        "food": {
          "lunch": {
            "name":  "La Table de Marius",
            "desc": "Treat yourself to a delicious seafood meal in a cozy atmosphere in the heart of St Malo."
          },
          "dinner": {
            "name":  "La Boucanerie",
            "desc": "Indulge in traditional Breton cuisine, including buckwheat pancakes and seafood dishes."
          }
        }
      },
      {
        "day":"3",
        "neighborhood": "Dinan",
        "site": "Dinan Old Town",
        "short_desc": "Charming medieval town with cobblestone streets and half-timbered houses.",
        "long_desc": "Dinan is a picturesque medieval town located on the banks of the Rance River. Explore the cobblestone streets and admire the half-timbered houses, as well as the many churches and monuments that dot the landscape. Discover unique boutiques and soak up the atmosphere of this charming town.",
        "walking_tour": [
          {"name": "Porte St-Malo", "desc": ""},
          {"name": "Place des Merciers", "desc": ""},
          {"name": "Tourelles du Château", "desc": ""}
        ],
        "food": {
          "lunch": {
            "name":  "Le Vieux Logis",
            "desc": "Enjoy a delightful meal in a charming setting, featuring traditional French cuisine with a modern twist."
          },
          "dinner": {
            "name":  "La Petite Maison du Vieux Dinan",
            "desc": "Indulge in delicious Breton dishes, such as cotriade, while admiring the beautiful views of Dinan."
          }
        }
      }];

    setActivities(sampleResponse);*/
    fetchActivities();
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
          {renderDays()}
          {renderDayTripItinerary()}
        </div>
      </main>
    </div>
  );
}
