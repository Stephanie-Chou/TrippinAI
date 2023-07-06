import Head from "next/head";
import { useState, useEffect, useRef, useLayoutEffect, ReactElement, RefObject} from "react";
import Day from "../components/Day";
import DayTrips from "../components/DayTrips";
import DownloadModal from "../components/DownloadModal";
import styles from "./index.module.css";
import { getStreamResponse } from "../utils/getStreamResponse";
import isJsonString from "../utils/isJsonString";
import * as stub from "../utils/stubData"
import { DEFAULT_INTERESTS } from "../utils/constants";
import {
  Activity,
  DayTrip,
  Food,
  Meta,
  Neighborhood,
  Photo,
  RetryDay,
  WalkingTourStep } from "../utils/types";
import Form from "../components/Form";

export default function Home() : ReactElement {

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [downloadButtonText, setDownloadButtonText] = useState('Download Plan as PDF');
  const [isDownloadButtonDisabled, setIsDownloadButtonDisabled] = useState(true);
  const [isStickyHeader, setIsStickyHeader] = useState(false);

  //Form State
  const [cityInput, setCityInput] = useState("");
  const [city, setCity] = useState("");
  const [checkedState, setCheckedState] = useState(
    DEFAULT_INTERESTS.map((interest) => ({name: interest, isChecked: false}))
  );
  const [tripLength, setTripLength] = useState(3);

  // Itinerary Model State
  const [dayTrips, setDayTrips] = useState([] as DayTrip[]);
  const [meta, setMeta] = useState({} as Meta);
  const [activities, setActivities] = useState([] as Activity[]);
  const [neighborhoods, setNeighborhoods] = useState([] as Neighborhood[]);
  const [foods, setFood] = useState([] as Food[]);

  // States
  interface LoadingState {
    days: boolean,
    dayTrips: boolean,
  };

  const [loading, setLoading] = useState({
    days: false,
    dayTrips: false,
  });
  
  useEffect(() => {
    fetchActivityDescriptions();
    fetchActivityLists();
    fetchFoods();
    fetchDayTripFoods();
    fetchDayTripDescriptions();
  }, [meta]);

  useEffect(() => {
    renderDays();
    setLoading((prev: LoadingState): LoadingState => ({
      days: false,
      dayTrips: prev.dayTrips,
    }));
  }, [activities, neighborhoods, foods, tripLength])

  const itineraryRef: RefObject<HTMLInputElement> = useRef<HTMLInputElement>(null)
  
  function scrollTo(ref: RefObject<HTMLInputElement>) {
    if (!ref.current) return;
    ref.current.scrollIntoView({behavior: 'smooth'});
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
    const selectedInterests = checkedState.map((item) => item.isChecked? item.name : "").filter((n)=>n).join()
    if (!selectedInterests || selectedInterests.length === 0) {
       return "general"
    }
    return selectedInterests;
  }
  /***********************
  * RENDER FUNCTIONS
  ************************/


  function renderDays() : ReactElement[]{
    if (activities.length === 0) return;
    let days : ReactElement[] = new Array(tripLength).fill(0);
    return days.map((day, i:number) => {
      return (
        <Day
          activity={activities[i]}
          neighborhood={neighborhoods[i]}
          food={foods[i]}
          index={i}
          locationName={city}
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
      const json : RetryDay = JSON.parse(streamResponse);

      setMeta((prevState: Meta): Meta => {
        const nextState : Meta = {...prevState};
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

  async function retryDayTrip(index: number): Promise<string>  {
    
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
        const nextState = {...prevState};
        nextState.dayTrips[index] = streamResponse;
        return nextState;
      });

      setDayTrips((prevState: DayTrip[]): DayTrip[] => {
        const nextState = [...prevState];
        nextState[index] = {
          name: streamResponse,
          short_desc: "",
          long_desc: "", 
          food: {name: "", desc: ""}
        };

        return nextState;
      });
    });
  }
  /***********************
  * DATA FETCH FUNCTIONS
  ************************/
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

    setDayTrips((prevState: DayTrip[]): DayTrip[] => {
      const nextState = [...prevState];
      nextState[index].food = json.lunch;
      return nextState;
    });
  }

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
    
    console.log(`fetching with inputs  ${cityInput} days: ${tripLength}` )

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
          food: {name: "", desc: ""}
        }
      }))

      setCityInput(""); // clear it so it rerenders don't refetch activities.
    });
  }

  function fetchFoods(): void {
    for (let i: number = 0; i< neighborhoods.length; i++) {
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
      body: JSON.stringify({ location: location.name +' ' + city, city: city}),
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
    for (let i: number = 0; i< activities.length; i++) {
      fetchActivityDescription(activities[i], i)
    }
  }

  function fetchDayTripDescriptions(): void {
    for (let i: number = 0; i< dayTrips.length; i++) {
      fetchDayTripDescription(dayTrips[i], i)
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
        body: JSON.stringify({location: location.name, city: city, interests: getInterestsString() })
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

  async function fetchDayTripDescription(location: DayTrip, index: number): Promise<string> {
      const response = await fetch("/api/generateActivityDescription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({location: location.name, city: city, interests: getInterestsString()})
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

  function fetchActivityLists(): void {    
    for (let i: number = 0; i< neighborhoods.length; i++) {
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
  async function fetchActivityList(neighborhood: Neighborhood, index: number): Promise<string>  {   
    setLoading((prev: LoadingState): LoadingState => ({
      days: true,
      dayTrips: prev.dayTrips,
    })); 
    const response = await fetch("/api/generateTour", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ neighborhood: neighborhood.name, city: city, interests: getInterestsString()}),
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
      fetchImage(site, index);

      setNeighborhoods((prevState: Neighborhood[]): Neighborhood[] => {
        let updatedNeighborhoods = [...prevState];
        updatedNeighborhoods[index].walking_tour = json;
        return updatedNeighborhoods;
      });
  }

  async function fetchImage(site: string, index: number): Promise<string> {
    if (!neighborhoods || neighborhoods.length === 0) return;
    try {
      const response = await fetch("/api/fetchUnsplashImage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ city, site})
    });

    
      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      let updatedNeighborhoods: Neighborhood[] = [...neighborhoods];
      updatedNeighborhoods[index].image = data.images[0];
      setNeighborhoods(updatedNeighborhoods);
    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error);
    }
  }

  function initializeItineraryStates(): void {
    const initActivities: Activity[] = Array.from({length: tripLength}, () => ({
      name:"",
      short_desc:"",
      long_desc:""
    }));

    const initNeighborhoods: Neighborhood[] = Array.from({length: tripLength}, () => ({
      name: "",
      walking_tour: [{} as WalkingTourStep],
      image: {} as Photo
    }));

    const initFood: Food[] = Array.from({length: tripLength}, () => ({
      lunch: {name:"", desc:""},
      dinner: {name:"", desc:""}
    }));

    const initDayTrips: DayTrip[] = Array.from({length: 2}, () =>  ({
      name: "",
      short_desc: "",
      long_desc: "",
      food: {name: "", desc:""}
    }));
    setDayTrips(initDayTrips);
    setActivities(initActivities);
    setNeighborhoods(initNeighborhoods);
    setFood(initFood);
  }
  /*****************
  * FORM FUNCTIONS
  ******************/
  async function onDownload(event): Promise<string> {
    if (!city) {
      setIsDownloadButtonDisabled(true)
      return;
    };

    setDownloadButtonText('Downloading ...');
    try {
      const response = await fetch("/api/createPDF", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          city: city,
          neighborhoods: neighborhoods,
          activities: activities,
          foods: foods,
          dayTrips: dayTrips
        })
    });

      const responseData = await response.json();
      if (response.status !== 200) {
        throw responseData.error || new Error(`Request failed with status ${response.status}`);
      }
      let arr= new Uint8Array(responseData.result.data);
      let buffer = arr.buffer

      let blob=new Blob([buffer], {type: "application/pdf"});
      const href = URL.createObjectURL(blob);

      // Creating new object of PDF file
      // Setting various property values
      let alink = document.createElement('a');
      document.body.appendChild(alink); // Required for this to work in FireFox
      alink.href = href;
      alink.download = "Trippin_Itinerary.pdf"
      alink.target = "_blank";
      alink.click();
      setDownloadButtonText('Download Plan as PDF');
    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      setDownloadButtonText('Error on Download');
    }
  }

  function onSubmit(event): void {
    setLoading({
      days: true,
      dayTrips: true,
    });
    event.preventDefault();

    initializeItineraryStates();
    fetchMeta();
    setIsDownloadButtonDisabled(false);

    scrollTo(itineraryRef);
  }

  const handleOnChange = (position) => {
    const updatedCheckedState = checkedState.map((item, index) =>
      index === position ? {name: item.name, isChecked: !item.isChecked} : item
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

  return (
    <div>
      <Head>
        <title>Trippin - The AI Powered Travel Planner</title>
        <link rel="icon" href="/JourneyGenieLogo_thick.png" />
        <meta property="og:image" content="https://stephaniechou.com/assets/images/trippinspo_logo.png"></meta>
        <meta name="description" content="Artificial Intelligence powered travel planner. Creates a one to five day itinerary, Recommends Day Trips and Food options. Get inspired for your next vacation."/>
        <meta name="_foundr" content="f785866cc563749ca77fcae47d19fb96"></meta>
      </Head>
        <main className={styles.main }>
          <div className={styles.hero}>
            <div className={styles.input}>
              <img src="/JourneyGenieLogo_thick.png" className={styles.icon} />
              <h1>Trippin</h1>
              <h2> The AI Powered Travel Planner </h2>
              <Form
                cityInput={cityInput}
                checkedState={checkedState}
                interests={DEFAULT_INTERESTS}
                loading={loading}
                tripLength={tripLength}
                onSubmit={onSubmit}
                handleOnChange={handleOnChange}
                setCity={setCity}
                setCityInput={setCityInput}
                setTripLength={setTripLength}
              />
            </div>
          </div>

          <div className={isStickyHeader ? (styles.fixedTop) : styles.mainHeader } ref={stickyHeader} id="mainHeader">
            <h4>Trippin</h4>
            <button
              onClick={onDownload}
              className={styles.download}
              disabled={isDownloadButtonDisabled}
            >
              {downloadButtonText}
            </button>
            <div className={styles.modal}>
              <button onClick={onModalOpenClick}>
                <img src="/tipjar.png"/>
              </button>
            </div>
          </div>    
          <div className={styles.result} ref={itineraryRef}>
            {city ? <h4>Travel Plan for {city}</h4> : ""}
            {renderDays()}
            <DayTrips
              dayTrips={dayTrips}
              locationName={city}
              retry={retryDayTrip}
            />
          </div>
          {isOpen && <DownloadModal onClose={onModalCloseClick}/>}


        </main>
    </div>
  );
}
