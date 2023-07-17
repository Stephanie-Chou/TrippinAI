import { useState, useRef, useEffect, RefObject } from 'react';
import { Photo } from "../utils/types";
import { DAY_IDS, DEFAULT_INTERESTS, TRAVEL_DAY_ID } from "../utils/constants";

import DayTrips from "../components/DayTrips";
import TravelDay from "../components/TravelDay";
import WhereToStay from "../components/WhereToStay";
import CalendarButton from "../components/CalendarButton";
import TravelDayButton from "../components/TravelDayButton";
import SplitPillMenu from "../components/SplitPillMenu";
import WhatToEat from "../components/WhatToEat";
import PageWrapper from "../components/PageWrapper";

import styles from "./index.module.css";
import { Redis } from '@upstash/redis'
import Days from '../components/Days';
import TripsSplash from '../components/TripsSplash';
import TipJarModal from '../components/TipJarModal';

export async function getServerSideProps({ query }) {
  // Fetch data from external API
  const client = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })

  let data = {
    tripLocation: null,
    tripLength: 0,
    meta: { dayTrips: [] },
    travelTips: '',
    whereToStay: '',
    whatToEat: '',
    activities: [],
    foods: [],
    neighborhoods: [],
    destinationImage: {} as Photo,
  }


  if (!query.id) {
    return { props: { data } }
  }

  const cache_res = await client.json.get(query.id);
  // const data = mock_full_page_cache_response;
  // cache returns null if no id.
  if (cache_res) {
    data = cache_res;
  }

  console.log('saved data', data);
  return { props: { data } }
}

export default function Trips({ data }) {
  // Modal State
  const [isOpen, setIsOpen] = useState(false);

  //Form State
  const [city, setCity] = useState(data.tripLocation);
  const [checkedState, setCheckedState] = useState(
    DEFAULT_INTERESTS.map((interest) => ({ name: interest, isChecked: false }))
  );
  const [tripLength, setTripLength] = useState(data.tripLength);
  const [destinationImage, setDestinationImage] = useState(data.destinationImage);
  const [placeholderDays, setPlaceholderDays] = useState(new Array(data.tripLength).fill(0));

  // Itinerary Model State
  const [travelTips, setTravelTips] = useState(data.travelTips);
  const [whereToStay, setWhereToStay] = useState(data.whereToStay);
  const [whatToEat, setWhatToEat] = useState(data.whatToEat);
  const [meta, setMeta] = useState(data.meta);
  const [activities, setActivities] = useState(data.activities);
  const [neighborhoods, setNeighborhoods] = useState(data.neighborhoods);
  const [foods, setFood] = useState(data.foods);
  const [dayTrips, setDayTrips] = useState(data.meta.dayTrips.map((trip) => {
    return {
      name: trip,
      short_desc: "",
      long_desc: "",
      food: { name: "", desc: "" },
      image: {} as Photo
    }
  }));
  const [showResult, setShowResult] = useState(tripLength > 0);

  const [loading, setLoading] = useState({
    days: false,
    dayTrips: false,
  });

  const [pageLoading, setPageLoading] = useState(false);
  const [pageLoadingText, setPageLoadingText] = useState('Please Wait ..');


  const itineraryRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null)

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

  const dayUnit = tripLength === 1 ? "day" : "days";
  const capitalizedCity = city ? city.split(' ').map((word: string) => word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : '').join(' ') : "";
  const itineraryData = {
    tripLocation: city,
    tripLength: tripLength,
    meta: meta,
    travelTips: travelTips,
    whereToStay: whereToStay,
    whatToEat: whatToEat,
    activities: activities,
    foods: foods,
    neighborhoods: neighborhoods,
    dayTrips: dayTrips,
    destinationImage: destinationImage,
  }

  return (
    <PageWrapper
      isPageLoading={pageLoading}
      pageLoadingText={pageLoadingText}>
      {!showResult && <TripsSplash />}
      {showResult && <div className={styles.index}>
        {!pageLoading && <div className={styles.fixedTop} id="mainHeader">
          <a href="/"><h4>Trippin</h4></a>
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
              <img src="/coffee.svg" />
            </button>
          </div>
        </div>}
        <div className={styles.result} ref={itineraryRef}>
          <div className={styles.plan_title}>
            {city ? <h3>{tripLength} {dayUnit} in {capitalizedCity}</h3> : ""}
          </div>

          {/* Travel Day */}
          <TravelDay locationName={city} travelTips={travelTips} image={destinationImage} />

          {/* TRIP DAYS */}
          <Days
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
          />

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
          <WhereToStay locationName={city} whereToStay={whereToStay} />

          {/* WHAT TO EAT*/}
          <WhatToEat locationName={city} whatToEat={whatToEat} />

          {/* SPACER */}
          <div className={styles.bottom_spacer}></div>

          {showResult && <SplitPillMenu
            isButtonDisabled={!showResult}
            setPageLoading={setPageLoading}
            setPageLoadingText={setPageLoadingText}
            itineraryData={itineraryData}
            onClick={handleScrollToSection}
            showSave={false}
            showShare={true}
          />}
        </div>
        {isOpen && <TipJarModal onClose={onModalCloseClick} />}
      </div>}
    </PageWrapper >
  );
}