import { ReactElement, useEffect } from "react";
import Day from "./Day";
import {
  Activity,
  Food,
  LoadingState,
  Meta,
  Neighborhood,
  Photo,
  RetryDay,
  WalkingTourStep
} from "../utils/types";
import { getStreamResponse } from "../utils/getStreamResponse";
import isJsonString from "../utils/isJsonString";
import fetchImage from "../utils/fetchImage";

export default function Days({ placeholderDays,
  activities,
  neighborhoods,
  foods,
  city,
  setLoading,
  meta,
  getInterestsString,
  setMeta,
  setActivities,
  setFood,
  setNeighborhoods }): ReactElement {

  useEffect(() => {
    fetchActivityDescriptions();
    fetchFoods();
    fetchActivityLists();
  }, [meta]);


  if (activities.length === 0) return;

  /***********************
  * RENDER FUNCTIONS
  ************************/
  async function retryDay(index: number): Promise<string> {
    const response = await fetch("/api/generateRetryActivity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ city: city, interests: getInterestsString(), currentActivities: meta.activities }),
    });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.statusText}`);
    }

    const data = response.body;
    if (!data) {
      return;
    }

    getStreamResponse(data).then((streamResponse: string) => {
      if (!isJsonString(streamResponse)) return;
      const json: RetryDay = JSON.parse(streamResponse);

      setMeta((prevState: Meta): Meta => {
        const nextState: Meta = { ...prevState };
        nextState.activities[index] = json.activity;
        nextState.neighborhoods[index] = json.neighborhood;
        return nextState;
      })

      setActivities((prevState: Activity[]): Activity[] => {
        const nextState = [...prevState];
        nextState[index] = {
          name: json.activity,
          short_desc: "",
          long_desc: "",
        };
        return nextState;
      });

      setNeighborhoods((prevState: Neighborhood[]): Neighborhood[] => {
        const nextState: Neighborhood[] = [...prevState];
        nextState[index] = {
          name: json.neighborhood,
          walking_tour: [{} as WalkingTourStep],
          image: {} as Photo
        }
        return nextState;
      });
    });
  }

  function fetchFoods(): void {
    for (let i: number = 0; i < neighborhoods.length; i++) {
      fetchFood(neighborhoods[i], i)
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

  async function fetchFood(neighborhood: Neighborhood, index: number): Promise<string> {
    setLoading((prev: LoadingState): LoadingState => ({
      days: true,
      dayTrips: prev.dayTrips,
    }));
    const response = await fetch("/api/generateFood", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ location: neighborhood.name, city: city }),
    });
    const responseData = await response.json();
    if (response.status !== 200) {
      throw responseData.error || new Error(`Request failed with status ${response.status}`);
    }

    const jsonStr: string = JSON.parse(responseData).result;
    if (!isJsonString(jsonStr)) {
      console.log('error');
      return;
    }
    const json: Food = JSON.parse(jsonStr);

    setFood((prevState: Food[]): Food[] => {
      let updatedFood: Food[] = [...prevState];
      updatedFood[index] = json;
      return updatedFood;
    });
  }

  function fetchActivityDescriptions(): void {
    for (let i: number = 0; i < activities.length; i++) {
      fetchActivityDescription(activities[i], i)
    }
  }

  /**
   * 
   * @param {*} activity 
   * @param {*} index 
   * @returns 
   * description: {
      "short_desc": "World-renowned art collection, including the Sistine Chapel.",
      "long_desc": "Explore the vast art collection of the Vatican Museums, housing masterpieces from different periods and cultures. Marvel at the stunning frescoes in the Sistine Chapel painted by Michelangelo and admire works by renowned artists like Raphael and Leonardo da Vinci."
    }
   */
  async function fetchActivityDescription(activity: Activity, index: number): Promise<string> {
    setLoading((prev: LoadingState): LoadingState => ({
      days: true,
      dayTrips: prev.dayTrips,
    }));

    const response = await fetch("/api/generateActivityDescription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ location: activity.name, city: city, interests: getInterestsString() })
    });

    const responseData = await response.json();
    if (response.status !== 200) {
      throw responseData.error || new Error(`Request failed with status ${response.status}`);
    }

    const jsonStr: string = JSON.parse(responseData).result;
    if (!isJsonString(jsonStr)) {
      return;
    }


    const json: Activity = JSON.parse(jsonStr);

    setActivities((prevState: Activity[]): Activity[] => {
      let updatedActivities: Activity[] = [...prevState];
      updatedActivities[index].long_desc = json.long_desc;
      updatedActivities[index].short_desc = json.short_desc;
      return updatedActivities;
    });
  }

  function fetchActivityLists(): void {
    for (let i: number = 0; i < neighborhoods.length; i++) {
      fetchActivityList(neighborhoods[i], i)
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
  async function fetchActivityList(neighborhood: Neighborhood, index: number): Promise<string> {
    setLoading((prev: LoadingState): LoadingState => ({
      days: true,
      dayTrips: prev.dayTrips,
    }));
    const response = await fetch("/api/generateTour", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ neighborhood: neighborhood.name, city: city, interests: getInterestsString() }),
    });
    const responseData = await response.json();
    if (response.status !== 200) {
      throw responseData.error || new Error(`Request failed with status ${response.status}`);
    }

    const jsonStr: string = JSON.parse(responseData).result;
    if (!isJsonString(jsonStr)) {
      return;
    }
    const json: WalkingTourStep[] = JSON.parse(jsonStr);

    const site: string = json[0].name;

    fetchImage(site, index, city).then((image: Photo) => {
      setNeighborhoods((prevState: Neighborhood[]): Neighborhood[] => {
        let updatedNeighborhoods = [...prevState];
        updatedNeighborhoods[index].image = image;
        updatedNeighborhoods[index].walking_tour = json;
        return updatedNeighborhoods;
      });
    });
  }
  return (
    <div>
      {placeholderDays.map((day, i: number) =>
        <Day
          activity={activities[i]}
          neighborhood={neighborhoods[i]}
          food={foods[i]}
          index={i}
          city={city}
          key={i}
          retry={retryDay}
        />
      )}
    </div>
  );
}