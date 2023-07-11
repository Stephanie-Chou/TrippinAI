import Head from "next/head";
import { useState, useEffect, useRef, useLayoutEffect, ReactElement, RefObject } from "react";
import Day from "../components/Day";
import DayTrips from "../components/DayTrips";
import TipJarModal from "../components/TipJarModal";
import styles from "./index.module.css";
import { getStreamResponse } from "../utils/getStreamResponse";
import isJsonString from "../utils/isJsonString";
import fetchImage from "../utils/fetchImage";
import * as stub from "../utils/stubData"
import { DAY_IDS, DEFAULT_INTERESTS, INIT_TRIP_LENGTH, TRAVEL_DAY_ID } from "../utils/constants";
import {
  Activity,
  DayTrip,
  Food,
  LoadingState,
  Meta,
  Neighborhood,
  Photo,
  RetryDay,
  WalkingTourStep
} from "../utils/types";
import Form from "../components/Form";
import TravelDay from "../components/TravelDay";
import WhereToStay from "../components/WhereToStay";
import CalendarButton from "../components/CalendarButton";
import TravelDayButton from "../components/TravelDayButton";
import SplitPillMenu from "../components/SplitPillMenu";
import WhatToEat from "../components/WhatToEat";
import CanvasBackground from "../components/CanvasBackground";
import Loader from "../components/Loader";

export default function Home(): ReactElement {

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [isStickyHeader, setIsStickyHeader] = useState(false);

  //Form State
  const [cityInput, setCityInput] = useState("");
  const [city, setCity] = useState("");
  const [checkedState, setCheckedState] = useState(
    DEFAULT_INTERESTS.map((interest) => ({ name: interest, isChecked: false }))
  );
  const [tripLength, setTripLength] = useState(INIT_TRIP_LENGTH);
  const [placeholderDays, setPlaceholderDays] = useState(new Array(INIT_TRIP_LENGTH).fill(0));

  // Itinerary Model State
  const [travelTips, setTravelTips] = useState("");
  const [whereToStay, setWhereToStay] = useState("");
  const [whatToEat, setWhatToEat] = useState("");
  const [meta, setMeta] = useState({} as Meta);
  const [activities, setActivities] = useState([] as Activity[]);
  const [neighborhoods, setNeighborhoods] = useState([] as Neighborhood[]);
  const [foods, setFood] = useState([] as Food[]);
  const [dayTrips, setDayTrips] = useState([] as DayTrip[]);
  const [showResult, setShowResult] = useState(false);

  /** STUB DATA */
  // const [travelTips, setTravelTips] = useState(stub.mock_travelDay);
  // const [whereToStay, setWhereToStay] = useState(stub.mock_neighborhood_recs);
  // const [whatToEat, setWhatToEat] = useState("");
  // const [dayTrips, setDayTrips] = useState(stub.mock_dayTrips);
  // const [meta, setMeta] = useState(stub.mock_meta);
  // const [activities, setActivities] = useState(stub.mock_activities);
  // const [neighborhoods, setNeighborhoods] = useState(stub.mock_neighborhoods);
  // const [foods, setFood] = useState(stub.mock_foods);
  // const [showResult, setShowResult] = useState(true);

  const [loading, setLoading] = useState({
    days: false,
    dayTrips: false,
  });

  useEffect(() => {
    fetchActivityDescriptions();
    fetchActivityLists();
    fetchFoods();
  }, [meta]);

  useEffect(() => {
    renderDays();
    setLoading((prev: LoadingState): LoadingState => ({
      days: false,
      dayTrips: prev.dayTrips,
    }));
  }, [activities, neighborhoods, foods, tripLength])

  useEffect(() => {
    scrollToRef(itineraryRef);
  }, [showResult])

  const itineraryRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null)

  function scrollToRef(ref: RefObject<HTMLDivElement>) {
    if (!ref.current) return;
    ref.current.scrollIntoView({ behavior: 'smooth' });
  }

  const stickyHeader: RefObject<HTMLInputElement> = useRef<HTMLInputElement>();
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
  * RENDER FUNCTIONS
  ************************/
  function renderDays(): ReactElement[] {
    if (activities.length === 0) return;
    return placeholderDays.map((day, i: number) => {
      return (
        <Day
          activity={activities[i]}
          neighborhood={neighborhoods[i]}
          food={foods[i]}
          index={i}
          city={city}
          key={i}
          retry={retryDay}
        />
      )
    })
  }

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

  /***********************
  * DATA FETCH FUNCTIONS
  ************************/
  /**
   * 
   * @returns Activities and Neighborhoods list.
   * {
      "activities": ["La Jolla Kayak Tour", "San Diego Zoo Safari Park", "USS Midway Museum"],
      "neighborhoods": ["La Jolla", "San Pasqual Valley", "Downtown San Diego"]
      "dayTrips": ["Mt. Rainier", "Snoqualmie Falls"]
    }
   */
  async function fetchMeta(): Promise<string> {
    if (!cityInput) return;

    console.log(`fetching with inputs  ${cityInput} days: ${tripLength}`)

    const response = await fetch("/api/generateMeta", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ city: cityInput, interests: getInterestsString(), tripLength: tripLength }),
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
      const json: Meta = JSON.parse(streamResponse);

      setMeta(json);
      setActivities(json.activities.map((activity: string): Activity => {
        return {
          name: activity,
          short_desc: "",
          long_desc: "",
        }
      }));

      setNeighborhoods(json.neighborhoods.map((neighborhood: string): Neighborhood => {
        return {
          name: neighborhood,
          walking_tour: [{} as WalkingTourStep],
          image: {} as Photo
        }
      }));

      setDayTrips(json.dayTrips.map((dayTrip: string): DayTrip => {
        return {
          name: dayTrip,
          short_desc: "",
          long_desc: "",
          food: { name: "", desc: "" },
          image: {} as Photo
        }
      }))

      setCityInput(""); // clear it so it rerenders don't refetch activities.
    });
  }

  async function fetchWhereToStay(): Promise<string> {
    if (!cityInput) return;
    const response = await fetch("/api/generateWhereToStay", {
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
    getStreamResponse(data, setWhereToStay);
  }

  async function fetchWhatToEat(): Promise<string> {
    if (!cityInput) return;
    const response = await fetch("/api/generateWhatToEat", {
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
    getStreamResponse(data, setWhatToEat);
  }

  async function fetchTravelDay(): Promise<string> {
    if (!cityInput) return;
    const response = await fetch("/api/generateTravelDay", {
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
    getStreamResponse(data, setTravelTips);
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
      body: JSON.stringify({ location: location.name + ' ' + city, city: city }),
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

  /*****************
  * FORM FUNCTIONS
  ******************/


  function onSubmit(event): void {
    if (showResult) {
      scrollToRef(itineraryRef);
    }
    event.preventDefault();
    setLoading({
      days: true,
      dayTrips: true,
    });
    setShowResult(true);

    initializeItineraryStates();
    fetchMeta();
    fetchTravelDay();
    fetchWhereToStay();
    fetchWhatToEat();
  }

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

  function handleTripLengthChange(event) {
    const length = parseInt(event.target.value)
    setTripLength(length);
    setPlaceholderDays(new Array(length).fill(0))
  }
  function handleScrollToSection(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  const dayUnit = tripLength === 1 ? "day" : "days";
  const capitalizedCity = city ? city.split(' ').map((word: string) => word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : '').join(' ') : "";
  const itineraryData = { city, neighborhoods, activities, foods, dayTrips };
  return (
    <div>
      <Head>
        <title>Trippin - The AI Powered Travel Planner</title>
        <link rel="icon" href="/JourneyGenieLogo_thick.png" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" />
        <meta property="og:image" content="https://stephaniechou.com/assets/images/trippinspo_logo.png"></meta>
        <meta name="description" content="Artificial Intelligence powered travel planner. Creates a one to five day itinerary, Recommends Day Trips and Food options. Get inspired for your next vacation." />
        <meta name="_foundr" content="f785866cc563749ca77fcae47d19fb96"></meta>
      </Head>
      <main className={styles.main}>
        <div className={styles.hero}>
          <CanvasBackground>
            <div className={styles.input}>
              <img src="/JourneyGenieLogo_thick.png" className={styles.icon} />
              <h1>Trippin</h1>
              <h2> The AI Powered Travel Planner </h2>
              <Form
                cityInput={cityInput}
                checkedState={checkedState}
                interests={DEFAULT_INTERESTS}
                tripLength={tripLength}
                onSubmit={onSubmit}
                handleOnChange={handleOnChange}
                setCity={setCity}
                setCityInput={setCityInput}
                handleTripLengthChange={handleTripLengthChange}
              />
            </div>
          </CanvasBackground>

        </div>

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

          {/* <Loader loading={loading} /> */}

          {/* Travel Day */}
          {showResult && <TravelDay locationName={city} travelTips={travelTips} />}

          {/* TRIP DAYS */}
          {renderDays()}

          {/* DAY TRIPS */}
          <DayTrips
            city={city}
            dayTrips={dayTrips}
            getInterestsString={getInterestsString}
            setMeta={setMeta}
            setDayTrips={setDayTrips}
            setLoading={setLoading}
            meta={meta}
          />
          {/* WHERE TO STAY */}
          {showResult && <WhereToStay locationName={city} whereToStay={whereToStay} />}

          {/* WHAT TO EAT*/}
          {showResult && <WhatToEat locationName={city} whatToEat={whatToEat} />}

          {/* SPACER */}
          <div className={styles.bottom_spacer}></div>

          {/* WHAT TO EAT */}
          {showResult && <SplitPillMenu
            isButtonDisabled={!showResult}
            isLoading={loading.dayTrips || loading.days}
            itineraryData={itineraryData}
            onClick={handleScrollToSection}
          />}
        </div>
        <div className={styles.footer}>Trippin Created by SugarJie Studios</div>
        {isOpen && <TipJarModal onClose={onModalCloseClick} />}
      </main>
    </div>
  );
}
