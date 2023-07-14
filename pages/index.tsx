import { useState, useEffect, useRef, useLayoutEffect, ReactElement, RefObject } from "react";

import styles from "./index.module.css";
import { getStreamResponse } from "../utils/getStreamResponse";
import isJsonString from "../utils/isJsonString";
import { DAY_IDS, DEFAULT_INTERESTS, INIT_TRIP_LENGTH, TRAVEL_DAY_ID } from "../utils/constants";
import {
  Activity,
  DayTrip,
  Food,
  LoadingState,
  Meta,
  Neighborhood,
  Photo,
  WalkingTourStep
} from "../utils/types";
import Form from "../components/Form";
import DayTrips from "../components/DayTrips";
import TipJarModal from "../components/TipJarModal";
import TravelDay from "../components/TravelDay";
import WhereToStay from "../components/WhereToStay";
import CalendarButton from "../components/CalendarButton";
import TravelDayButton from "../components/TravelDayButton";
import SplitPillMenu from "../components/SplitPillMenu";
import WhatToEat from "../components/WhatToEat";
import CanvasBackground from "../components/CanvasBackground";
import PageWrapper from "../components/PageWrapper";
import Days from "../components/Days";
import { stringify } from "querystring";

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

  const stickyHeader: RefObject<HTMLInputElement> = useRef<HTMLInputElement>();
  const itineraryRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading((prev: LoadingState): LoadingState => ({
      days: false,
      dayTrips: prev.dayTrips,
    }));
  }, [activities, neighborhoods, foods, tripLength])

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

      setCityInput(""); // clear it so rerenders don't refetch activities.
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

  function initializeItineraryStates(): void {
    console.log("initialize itinerary states");
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

  async function handleOnShare(event) {
    event.preventDefault();
    // create the trip id
    // save the trip data
    const data = {
      tripLocation: city,
      tripLength: tripLength,
      meta: meta,
      travelTips: travelTips,
      whereToStay: whereToStay,
      whatToEat: whatToEat,
      activities: activities,
      foods: foods,
      neighborhoods: neighborhoods,
    };
    const response = await fetch("/api/redis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: JSON.stringify(data), city: city })
    });

    const dataResponse = await response.json();
    const humanReadableDate = new Date(dataResponse.expire_at).getDate()
    console.log(humanReadableDate, dataResponse.uuid);

  }

  const dayUnit = tripLength === 1 ? "day" : "days";
  const capitalizedCity = city ? city.split(' ').map((word: string) => word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : '').join(' ') : "";
  const itineraryData = { city, neighborhoods, activities, foods, dayTrips };
  return (
    <PageWrapper>
      <div className={styles.index}>
        <div className={styles.hero}>
          <CanvasBackground>
            <div className={styles.form_container}>
              <img src="/JourneyGenieLogo_thick.png" className={styles.icon} alt={"Trippinspo Logo: dotted line to location marker"} />
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
          {<Days
            placeholderDays={placeholderDays}
            activities={activities}
            neighborhoods={neighborhoods}
            foods={foods}
            getInterestsString={getInterestsString}
            city={city}
            setLoading={setLoading}
            meta={meta}
            setMeta={setMeta}
            setActivities={setActivities}
            setFood={setFood}
            setNeighborhoods={setNeighborhoods}
          />}

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
          <button onClick={handleOnShare}>Share</button>
          {/* WHAT TO EAT */}
          {showResult && <SplitPillMenu
            isButtonDisabled={!showResult}
            isLoading={loading.dayTrips || loading.days}
            itineraryData={itineraryData}
            onClick={handleScrollToSection}
          />}
        </div>
        {isOpen && <TipJarModal onClose={onModalCloseClick} />}
      </div>
    </PageWrapper >
  );
}
