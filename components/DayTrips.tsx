import { useEffect, useState } from "react";
import Page from "./Page";
import styles from "./day.module.css";
import { DayTrip, LoadingState, Meta, Photo, Food } from "../utils/types";
import { DAY_TRIP_IDS } from "../utils/constants";
import { getStreamResponse } from "../utils/getStreamResponse";
import isJsonString from "../utils/isJsonString";
import fetchImage from "../utils/fetchImage";

export default function DayTrips({
  dayTrips,
  city,
  meta,
  getInterestsString,
  setDayTrips,
  setLoading,
  setMeta }) {

  useEffect(() => {
    fetchDayTripFoods();
    fetchDayTripDescriptions();
  }, [meta]);

  async function retry(index: number): Promise<string> {

    const response = await fetch("/api/generateRetryDayTrip", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ city: city, interests: getInterestsString(), currentTrips: meta.dayTrips }),
    });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.statusText}`);
    }

    const data = response.body;
    if (!data) {
      return;
    }
    getStreamResponse(data).then((streamResponse: string) => {
      setMeta((prevState: Meta): Meta => {
        const nextState = { ...prevState };
        nextState.dayTrips[index] = streamResponse;
        return nextState;
      });

      setDayTrips((prevState: DayTrip[]): DayTrip[] => {
        const nextState = [...prevState];
        nextState[index] = {
          name: streamResponse,
          short_desc: "",
          long_desc: "",
          food: { name: "", desc: "" },
          image: {} as Photo
        };

        return nextState;
      });
    });
  }

  function fetchDayTripDescriptions(): void {
    for (let i: number = 0; i < dayTrips.length; i++) {
      fetchDayTripDescription(dayTrips[i], i)
    }
  }
  async function fetchDayTripDescription(location: DayTrip, index: number): Promise<string> {
    const response = await fetch("/api/generateActivityDescription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ location: location.name, city: city, interests: getInterestsString() })
    });

    const responseData = await response.json();
    if (response.status !== 200) {
      console.log(response);
      throw responseData.error || new Error(`Request failed with status ${response.status}`);
    }
    const jsonStr: string = JSON.parse(responseData).result;
    if (!isJsonString(jsonStr)) {
      return;
    }
    const json: DayTrip = JSON.parse(jsonStr);
    setDayTrips((prevState: DayTrip[]): DayTrip[] => {
      let updatedDayTrips: DayTrip[] = [...prevState];
      updatedDayTrips[index].long_desc = json.long_desc;
      updatedDayTrips[index].short_desc = json.short_desc;
      return updatedDayTrips;
    });

    setLoading((prev: LoadingState): LoadingState => ({
      days: prev.dayTrips,
      dayTrips: false,
    }));
  }

  function fetchDayTripFoods(): void {
    for (let i: number = 0; i < dayTrips.length; i++) {
      fetchDayTripFood(dayTrips[i], i);
    }
  }

  async function fetchDayTripFood(dayTrip: DayTrip, index: number): Promise<string> {
    const response = await fetch("/api/generateFood", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ location: dayTrip.name, city: city }),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.statusText}`);
    }

    const responseData = await response.json();
    if (response.status !== 200) {
      throw responseData.error || new Error(`Request failed with status ${response.status}`);
    }

    const jsonStr: string = JSON.parse(responseData).result;

    if (!isJsonString(jsonStr)) {
      return;
    }
    const json: Food = JSON.parse(jsonStr);

    fetchImage(dayTrip.name, index).then((image: Photo) => {
      setDayTrips((prevState: DayTrip[]): DayTrip[] => {
        const nextState = [...prevState];
        nextState[index].food = json.lunch;
        nextState[index].image = image;
        return nextState;
      });
    })
  }

  return dayTrips.map((trip: DayTrip, index: number) => {
    const image: Photo = trip.image;
    let urls = !image ? { regular: '' } : image.urls;
    let user = !image ? { username: '', name: '' } : image.user;
    let username: string = !user ? '' : user.username
    return (
      <Page
        header={city}
        subheader="Day Trip"
        key={index}
        id={DAY_TRIP_IDS[index]}
      >
        <h3>{trip.name}</h3>
        <div>{trip.long_desc}</div>
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
              <td>Food: Look for {trip.food.name}</td>
              <td>{trip.food.desc}</td>
            </tr>
          </tbody>
        </table>

        <button className={styles.retryButton} onClick={() => retry(index)}><span className="material-symbols-outlined">autorenew</span></button>

        {urls ? <img className={styles.image} src={urls.regular} /> : null}
        <a
          className={styles.credit}
          target="_blank"
          href={`https://unsplash.com/@${username}?utm_source=TrippinAI&utm_medium=referral`}
        >
          {user ? user.name : ''}
        </a> on <a className={styles.credit} href="https://unsplash.com?utm_source=TrippinAI&utm_medium=referral">Unsplash</a>
      </Page>
    )
  })
}