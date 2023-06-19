import Head from "next/head";
import { useState, useEffect, use } from "react";
import styles from "./index.module.css";

import {
  createParser,
} from "eventsource-parser";

import Page from "../components/Page";
import Itinerary from "../components/Itinerary";

export default function Home() {
  const DEFAULT_INTERESTS = ["Food", "Off the beaten path", "Adventure", "History"];

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
  const [meta, setMeta] = useState();
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
    renderDays(activities, neighborhoods, food)
  }, [activities, neighborhoods, food])

  useEffect(() => {
  }, [errorMessages])
  
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
    if (activities.length === 0) return;
    let subheader;
    let days = new Array(tripLength).fill(0);
    return days.map((day, i) => {
      subheader = "Day " + (i + 1);
      return (
        <>
          <Page
            header={locationName}
            subheader={subheader}
          >
            <Itinerary
              activity={activities[i]}
              food={food[i]}
              neighborhood={neighborhoods[i]}
            />
          </Page>
          
          <Page
            header={locationName}
            subheader={subheader}
          >
            <h3> {activities[i].name}</h3>
            {activities[i].long_desc}
          </Page>

          <Page
            header={locationName}
            subheader={subheader}
          >
            <h3> {neighborhoods[i].name} Walking Tour</h3>
            {renderWalkingTourLong(neighborhoods[i].walking_tour)}
          </Page>
        </>
      )
    })
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

    const response = await fetch("/api/generateActivity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ city: cityInput, interests: selectedInterests }),
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
      const json = JSON.parse(streamResponse);

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
      const json = JSON.parse(streamResponse);

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
      const json = JSON.parse(streamResponse);

      if (json.error) {
        setErrorMessages(errorMessages.push(json.error));
        return;
      }

      updatedActivities[index].long_desc = json.long_desc;
      updatedActivities[index].short_desc = json.short_desc;
      setActivities(updatedActivities);
    });
  }

  /**
   * 
   * @param {*} neighborhoods 
   */
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

    getStreamResponse(data).then((streamResponse) => {
      const json = JSON.parse(streamResponse);

      if (json.error) {
        setErrorMessages(errorMessages.push(json.error));
        return;
      }

      let updatedNeighborhoods = neighborhoods;
      updatedNeighborhoods[index].walking_tour = json;
      setNeighborhoods(updatedNeighborhoods);
    });
  }

  function initializeItineraryStates() {
    const initActivities = Array.from({length: tripLength}, () => ({
      name:"",
      short_desc:"",
      long_desc:""
    }));

    const initNeighborhoods = Array.from({length: tripLength}, () => ({
      name: "",
      walking_tour: []
    }));

    const initFood = Array.from({length: tripLength}, () => ({
      lunch: {name:"", desc:""},
      dinner: {name:"", desc:""}
    }));
    setActivities(initActivities);
    setNeighborhoods(initNeighborhoods);
    setFood(initFood)
  }

  async function onSubmit(event) {
    setLoading({
      activities:true,
      dayTrips: true,
    });
    event.preventDefault();

    initializeItineraryStates();
    
    let sample_response ={
      "activities":[{
          "day": "1",
          "neighborhood": "Ancient Rome",
          "site": "Colosseum",
          "short_desc": "Iconic amphitheater of Ancient Rome, known for gladiatorial contests.",
          "long_desc": "Step into the grandeur of Ancient Rome at the Colosseum, the largest amphitheater ever built. Discover the history of gladiators, explore the vast arena, and marvel at the architectural masterpiece that has stood for centuries.",
          "walking_tour": [
            {
              "name": "Roman Forum",
              "desc":"Immerse yourself in the ruins of the political and social center of Ancient Rome, filled with temples, basilicas, and ancient buildings."
            },
            {
              "name": "Palatine Hill",
              "desc":"Explore the birthplace of Rome's civilization and enjoy panoramic views of the city from this historic hill."
            },
            {
              "name": "Circus Maximus",
              "desc":"Wander through the ancient chariot racing stadium and imagine the excitement of the games that once took place here."
            }
          ],
          "food": {
            "lunch": {
              "name":  "Trattoria da Lucia",
              "desc":"Indulge in traditional Roman cuisine, including pasta, pizza, and classic Roman dishes."
            },
            "dinner": {
              "name": "Osteria Barberini",
              "desc":"Experience authentic Roman flavors in a cozy and welcoming atmosphere."
            }
          }
        },
        {
          "day": "2",
          "neighborhood": "Vatican City",
          "site": "Vatican Museums",
          "short_desc": "World-renowned art collection, including the Sistine Chapel.",
          "long_desc": "Explore the vast art collection of the Vatican Museums, housing masterpieces from different periods and cultures. Marvel at the stunning frescoes in the Sistine Chapel painted by Michelangelo and admire works by renowned artists like Raphael and Leonardo da Vinci.",
          "walking_tour": [
            {
              "name": "St. Peter's Basilica",
              "desc":"Discover the largest church in the world, known for its breathtaking architecture and religious significance."
            },
            {
              "name": "Vatican Gardens",
              "desc":"Stroll through the beautifully landscaped gardens, filled with lush greenery, fountains, and sculptures."
            },
            {
              "name": "Castel Sant'Angelo",
              "desc":"Visit this ancient fortress and former papal residence, offering panoramic views of Rome from its terrace."
            }
          ],
          "food": {
            "lunch": {
              "name":  "Ristorante il Fico",
              "desc":"Enjoy a delightful Italian meal with fresh ingredients and a charming ambiance near the Vatican."
            },
            "dinner":{
              "name":  "Hostaria Romana",
              "desc":"Indulge in classic Roman dishes, including cacio e pepe and saltimbocca alla romana."
            }
          }
        },
        {
          "day":"3",
          "neighborhood": "Trastevere",
          "site": "Piazza Santa Maria in Trastevere",
          "short_desc": "Lively square in the charming Trastevere neighborhood.",
          "long_desc": "Immerse yourself in the vibrant atmosphere of Trastevere at Piazza Santa Maria in Trastevere. Admire the beautiful Basilica of Santa Maria in Trastevere, relax at a café while people-watching, and soak up the lively energy of this picturesque square.",
          "walking_tour": [
            {
              "name": "Villa Farnesina",
              "desc":"Explore this Renaissance villa adorned with exquisite frescoes by renowned artists like Raphael."
            },
            {
              "name": "Gianicolo Hill",
              "desc":"Climb to the top of this hill for stunning views of Rome's skyline and the opportunity to witness the traditional midday cannon firing."
            },
            {
              "name": "Isola Tiberina",
              "desc":"Cross the Tiber River to reach this charming island and take a leisurely stroll along its picturesque streets."
            }
          ],
          "food": {
            "lunch":{
              "name":  "Da Enzo al 29",
              "desc":"Taste authentic Roman cuisine with homemade pasta and traditional dishes in the heart"
            },
            "dinner": {
              "name": "La Tavernaccia",
              "desc": "known for its traditional Roman cuisine and warm ambiance."
            }
          }
        }
      ],
      "day_trips": [{
          "name": "Yosemite National Park",
          "short_desc": "Experience the beauty of this world-famous park, with its towering cliffs and cascading waterfalls.",
          "long_desc": "This day trip takes you to Yosemite National Park, one of the most stunning and iconic natural landmarks in the United States. Explore the majestic sequoia groves, towering cliffs, and cascading waterfalls, and don't miss the opportunity to take a hike or a scenic drive. ",
          "food": {
            "name": "The Ahwahnee",
            "desc": "Located in Yosemite National Park, The Ahwahnee offers a unique dining experience. Enjoy the freshest ingredients and exquisite seasonal specialties. "
          }
        },
        {
          "name": "Muir Woods National Monument",
          "short_desc": "Stroll through ancient redwood groves in this tranquil sanctuary near San Francisco.",
          "long_desc": "This day trip takes you to Muir Woods National Monument, a tranquil sanctuary of ancient redwood groves. Enjoy the peace and quiet of this stunning natural wonder, and don't forget to explore nearby Mount Tamalpais for breathtaking views of the bay. ",
          "food": {
            "name": "The Counter",
            "desc": "Stop by The Counter for a delicious and creative meal. Try one of their signature burgers, salads, or sandwiches."
          }
        }
      ]
    }

    // const activities = sample_response.activities; // list of activity objects
    // const dayTrips = sample_response.day_trips; // list of daytrip ojects
    // setActivities(activities);
    // setDayTrips(dayTrips);
    fetchDayTrips();
    fetchActivities();
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
            {renderLoader()}
            {errorMessages.join(', ')}
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
