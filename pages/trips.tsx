import { useRouter } from 'next/router'
import { useState, useRef, useEffect, useLayoutEffect, RefObject } from 'react';

import {
  Activity,
  DayTrip,
  Food,
  Meta,
  Neighborhood,
  Photo,
  LoadingState,
  WalkingTourStep
} from "../utils/types";
import { DAY_IDS, DEFAULT_INTERESTS, INIT_TRIP_LENGTH, TRAVEL_DAY_ID } from "../utils/constants";

import Day from "../components/Day";
import DayTrips from "../components/DayTrips";
import TravelDay from "../components/TravelDay";
import WhereToStay from "../components/WhereToStay";
import CalendarButton from "../components/CalendarButton";
import TravelDayButton from "../components/TravelDayButton";
import SplitPillMenu from "../components/SplitPillMenu";
import WhatToEat from "../components/WhatToEat";
import PageWrapper from "../components/PageWrapper";

import styles from "./index.module.css";
import isJsonString from "../utils/isJsonString";
import fetchImage from "../utils/fetchImage";
import { Redis } from '@upstash/redis'
export async function getServerSideProps() {
  console.log('getServerSideProps called')
  // Fetch data from external API
  const client = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })

  const res = await import('../pages/api/redis');
  console.log('response', res);
  res.default

  const data = await res.json();
  if (!res) {
    throw new Error(`Trips Request failed. bad key?`);
  }

  // set the interests?
  // fetch the rest of the things
  // Pass data to the page via props
  return { props: { data } }
}
export default function Trips({ data }) {

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [isStickyHeader, setIsStickyHeader] = useState(false);

  //Form State
  const [city, setCity] = useState(data.tripLocation);
  const [checkedState, setCheckedState] = useState(
    DEFAULT_INTERESTS.map((interest) => ({ name: interest, isChecked: false }))
  );
  const [tripLength, setTripLength] = useState(data.tripLength);
  const [placeholderDays, setPlaceholderDays] = useState(new Array(data.tripLength).fill(0));

  // Itinerary Model State
  const [travelTips, setTravelTips] = useState("");
  const [whereToStay, setWhereToStay] = useState("");
  const [whatToEat, setWhatToEat] = useState("");
  const [meta, setMeta] = useState({
    dayTrips: data.dayTrips || [] as DayTrip[],
    foods: [] as Food[],
    activities: [] as Activity[],
    neighborhoods: [] as Neighborhood[],
  });
  const [activities, setActivities] = useState([] as Activity[]);
  const [neighborhoods, setNeighborhoods] = useState([] as Neighborhood[]);
  const [foods, setFood] = useState([] as Food[]);
  const [dayTrips, setDayTrips] = useState([] as DayTrip[]);
  const [showResult, setShowResult] = useState(true);

  const [loading, setLoading] = useState({
    days: false,
    dayTrips: false,
  });

  const stickyHeader: RefObject<HTMLInputElement> = useRef<HTMLInputElement>();
  const itineraryRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeItineraryStates();
  }, [tripLength])

  /***********************
  * WINDOW FUNCTIONS
  ************************/
  useEffect(() => {
    scrollToRef(itineraryRef);
  }, [showResult])

  function scrollToRef(ref: RefObject<HTMLDivElement>) {
    if (!ref.current) return;
    ref.current.scrollIntoView({ behavior: 'smooth' });
  }

  useLayoutEffect(() => {
    if (!stickyHeader.current) return;

    let fixedTop = stickyHeader.current.offsetTop
    const fixedHeader = () => {
      if (window.pageYOffset > fixedTop) {
        setIsStickyHeader(true);
      } else {
        setIsStickyHeader(false);
      }
    }
    window.addEventListener('scroll', fixedHeader)
  }, [])

  function getInterestsString(): string {
    const selectedInterests = checkedState.map((item) => item.isChecked ? item.name : "").filter((n) => n).join()
    if (!selectedInterests || selectedInterests.length === 0) {
      return "general"
    }
    return selectedInterests;
  }

  /***********************
  * HANDLER FUNCTIONS
  ************************/

  const handleOnChange = (position) => {
    const updatedCheckedState = checkedState.map((item, index) =>
      index === position ? { name: item.name, isChecked: !item.isChecked } : item
    );
    setCheckedState(updatedCheckedState)
  }

  function onModalOpenClick(event) {
    event.preventDefault();
    setIsOpen(true);
  }

  function onModalCloseClick(event) {
    event.preventDefault();
    setIsOpen(false);
  }

  function handleScrollToSection(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }


  /***********************
  * DATA FETCH FUNCTIONS
  ************************/

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

  async function fetchFood(location: Neighborhood, index: number): Promise<string> {
    setLoading((prev: LoadingState): LoadingState => ({
      days: true,
      dayTrips: prev.dayTrips,
    }));
    const response = await fetch("/api/generateFood", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ location: location.name, city: city }),
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
  async function fetchActivityDescription(location: Activity, index: number): Promise<string> {
    setLoading((prev: LoadingState): LoadingState => ({
      days: true,
      dayTrips: prev.dayTrips,
    }));

    const response = await fetch("/api/generateActivityDescription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ location: location.name, city: city, interests: getInterestsString() })
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

  /***********************
  * Initialization
  ************************/
  function initializeItineraryStates(): void {
    const initActivities: Activity[] = Array.from({ length: tripLength }, () => ({
      name: "",
      short_desc: "",
      long_desc: ""
    }));

    const initNeighborhoods: Neighborhood[] = Array.from({ length: tripLength }, () => ({
      name: "",
      walking_tour: [{} as WalkingTourStep],
      image: {} as Photo
    }));

    const initFood: Food[] = Array.from({ length: tripLength }, () => ({
      lunch: { name: "", desc: "" },
      dinner: { name: "", desc: "" }
    }));

    const initDayTrips: DayTrip[] = Array.from({ length: 2 }, () => ({
      name: "",
      short_desc: "",
      long_desc: "",
      food: { name: "", desc: "" },
      image: {} as Photo
    }));
    setDayTrips(initDayTrips);
    setActivities(initActivities);
    setNeighborhoods(initNeighborhoods);
    setFood(initFood);
  }

  // HANDLE THE ROUTER
  // const router = useRouter()
  // const id = router.query.id;



  const dayUnit = tripLength === 1 ? "day" : "days";
  const capitalizedCity = city ? city.split(' ').map((word: string) => word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : '').join(' ') : "";
  const itineraryData = { city, neighborhoods, activities, foods, dayTrips };
  return (
    <PageWrapper>
      <div className={styles.index}>
        <div className={isStickyHeader ? (styles.fixedTop) : styles.mainHeader} ref={stickyHeader} id="mainHeader">
          <h4>Trippin</h4>
          <div className={styles.calendar_button_container}>
            <TravelDayButton onClick={(e) => {
              e.preventDefault();
              handleScrollToSection(TRAVEL_DAY_ID)
            }} />
            {placeholderDays.map((day, index) => {
              return <CalendarButton index={index} onClick={(e) => {
                e.preventDefault();
                handleScrollToSection(DAY_IDS[index])
              }} />
            })}
          </div>

          <div className={styles.modal}>
            <button onClick={onModalOpenClick}>
              <img src="/tipjar.png" />
            </button>
          </div>
        </div>
        <div className={styles.result} ref={itineraryRef}>
          <div className={styles.plan_title}>
            {city ? <h3>{tripLength} {dayUnit} in {capitalizedCity}</h3> : ""}
          </div>

          {/* Travel Day */}
          {/* {showResult && <TravelDay locationName={city} travelTips={travelTips} />} */}

          {/* TRIP DAYS */}
          {/* {renderDays()} */}

          {/* DAY TRIPS */}
          <DayTrips
            city={city}
            dayTrips={dayTrips}
            getInterestsString={getInterestsString}
            setMeta={setMeta}
            setDayTrips={setDayTrips}
            setLoading={false}
            meta={meta}
          />

          {/* SPACER */}
          <div className={styles.bottom_spacer}></div>

          {/* MENU */}
          {showResult && <SplitPillMenu
            isButtonDisabled={!showResult}
            isLoading={false}
            itineraryData={itineraryData}
            onClick={handleScrollToSection}
          />}
        </div>
      </div>
    </PageWrapper >

  );



}