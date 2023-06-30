import Head from "next/head";
import { useState, useEffect, useRef, useLayoutEffect} from "react";
import Day from "../components/Day";
import DayTrips from "../components/DayTrips";
import DownloadModal from "../components/DownloadModal";
import styles from "./index.module.css";
import { getStreamResponse } from "../utils/getStreamResponse";
import isJsonString from "../utils/isJsonString";
import * as stub from "../utils/stubData"

export default function Home() {
  const DEFAULT_INTERESTS = ["Food", "Off the Beaten Path", "Adventure", "History", "Culture"];

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [downloadButtonText, setDownloadButtonText] = useState('Download Plan as PDF');
  const [isDownloadButtonDisabled, setIsDownloadButtonDisabled] = useState(true);
  const [isStickyHeader, setIsStickyHeader] = useState(false);

  //Form State
  const [cityInput, setCityInput] = useState("");
  const [locationName, setLocationName] = useState("");
  const [checkedState, setCheckedState] = useState(
    DEFAULT_INTERESTS.map((interest) => ({name: interest, isChecked: false}))
  );
  const [tripLength, setTripLength] = useState(3);

  // Itinerary Model State
  const [dayTrips, setDayTrips] = useState([]);
  const [meta, setMeta] = useState({}); // array of activities, array of neighborhood names, array of dayTrips
  const [activities, setActivities] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [food, setFood] = useState([]);

  // States
  const [loading, setLoading] = useState({
    days: false,
    dayTrips: false,
  });
  const [errorMessages, setErrorMessages] = useState([]);
  
  useEffect(() => {
    fetchActivityDescriptions(meta);
    fetchWalkingTours(meta);
    fetchFoods(meta);
    fetchDayTrips(meta);
  }, [meta]);

  useEffect(() => {
    renderDays(activities, neighborhoods, food, tripLength);
    setLoading((prev) => ({
      days: false,
      dayTrips: prev.dayTrips,
    }));
  }, [activities, neighborhoods, food, tripLength])

  const myRef = useRef(null)
  function scrollTo(ref) {
    if (!ref.current) return;
    ref.current.scrollIntoView({behavior: 'smooth'});
  }

  const stickyHeader = useRef()
  useLayoutEffect(() => {
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

  /***********************
  * RENDER FUNCTIONS
  ************************/
  function renderLoader() {
    const {days, dayTrips} = loading;
    return (days || dayTrips) ? 
      <div className={styles.loader}>
        <div className={styles.ldsellipsis}><div></div><div></div><div></div><div></div></div>
      </div>: null;
  }

  function renderDays() {
    if (activities.length === 0) return;
    let days = new Array(tripLength).fill(0);
    return days.map((day, i) => {
      return (
        <Day
          activity={activities[i]}
          neighborhood={neighborhoods[i]}
          food={food[i]}
          index={i}
          locationName={locationName}
          key={i}
          retry={retryDay}
        />
      )
    })
  }

  async function retryDay(index) {
    const selectedInterests = checkedState.map((item) => item.isChecked? item.name : "").filter((n)=>n).join()
    const response = await fetch("/api/generateRetryActivity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ city: locationName, interests: selectedInterests, currentActivities: meta.activities }),
    });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.statusText}`);
    }

    const data = response.body;
    if (!data) {
      return;
    }

    getStreamResponse(data).then((streamResponse) => {
      if (!isJsonString(streamResponse)) return;
      const json = JSON.parse(streamResponse);

      if (json.error) {
        setErrorMessages((prevState) => {
          return nextState = [...prevState, json.error]
        })
      }

      setMeta((prevState) => {
        const nextState = {...prevState};
        nextState.activities[index] = json.activity;
        nextState.neighborhoods[index] = json.neighborhood;
        return nextState;
      })

      setActivities((prevState) => {
        const nextState = [...prevState];
        nextState[index] = {
          name: json.activity,
          short_desc: "",
          long_desc: "", 
        };
        return nextState;
      });

      setNeighborhoods((prevState) => {
        const nextState = [...prevState];
        nextState[index] = {
          name: json.neighborhood,
          walking_tour: []
        }
        return nextState;
      });
    });
  }

  async function retryDayTrip(index) {
    const selectedInterests = checkedState.map((item) => item.isChecked? item.name : "").filter((n)=>n).join()
    const response = await fetch("/api/generateRetryDayTrip", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ city: locationName, interests: selectedInterests, currentTrips: meta.dayTrips }),
    });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.statusText}`);
    }

    const data = response.body;
    if (!data) {
      return;
    }

    getStreamResponse(data).then((streamResponse) => {
      setMeta((prevState) => {
        const nextState = {...prevState};
        nextState.dayTrips[index] = streamResponse;
        return nextState;
      })

      setDayTrips((prevState) => {
        const nextState = [...prevState];
        nextState[index] = {
          name: streamResponse,
          short_desc: "",
          long_desc: "", 
          food: {}
        };
        return nextState;
      });
    });
  }
  /***********************
  * DATA FETCH FUNCTIONS
  ************************/
  async function fetchDayTrips() {
    for (let i = 0; i < dayTrips.length; i++) {
      fetchDayTrip(dayTrips[i], i);
    }
  }

  async function fetchDayTrip(dayTrip, index) {
    const response = await fetch("/api/generateDayTrip", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ city: locationName, location: dayTrip.name }),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.statusText}`);
    }

    const responseData = await response.json();
    if (response.status !== 200) {
      throw responseData.error || new Error(`Request failed with status ${response.status}`);
    }

    const jsonStr = JSON.parse(responseData).result;

    if (!isJsonString(jsonStr)) {
      console.log('bad json string');
      return;
    }
    const json = JSON.parse(jsonStr);

    setDayTrips((prev) => {
      const nextState = [...prev];
      nextState[index] = json;
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
    async function fetchMeta() {
    if (!cityInput) return;
    const selectedInterests = checkedState.map((item) => item.isChecked? item.name : "").filter((n)=>n).join()
    console.log(`fetching with inputs  ${cityInput} days: ${tripLength}` )

    const response = await fetch("/api/generateMeta", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ city: cityInput, interests: selectedInterests, tripLength: tripLength }),
    });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.statusText}`);
    }

    const data = response.body;
    if (!data) {
      return;
    }
    getStreamResponse(data).then((streamResponse) => {
      if (!isJsonString(streamResponse)) return;
      const json = JSON.parse(streamResponse);
      if (json.error) {
        setErrorMessages((prevState) => {
          return nextState = [...prevState, json.error]
        })
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

      setDayTrips(json.dayTrips.map((dayTrip) => {
        return {
          name: dayTrip,
          short_desc: "",
          long_desc: "",
          food: {}
        }
      }))

      setCityInput(""); // clear it so it rerenders don't refetch activities.
    });
  }

  async function fetchFoods() {
    for (let i = 0; i< neighborhoods.length; i++) {
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

  async function fetchFood(neighborhood, index) {
    setLoading((prev) => ({
      days: true,
      dayTrips: prev.dayTrips,
    }));
    const response = await fetch("/api/generateRestaurants", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ neighborhood: neighborhood.name, city: locationName}),
    });
    const responseData = await response.json();
    if (response.status !== 200) {
      throw responseData.error || new Error(`Request failed with status ${response.status}`);
    }

    const jsonStr = JSON.parse(responseData).result;
    if (!isJsonString(jsonStr)) {
      console.log('error');
      return;
    }
    const json = JSON.parse(jsonStr);
      if (json.error) {
        setErrorMessages((prevState) => {
          return nextState = [...prevState, json.error]
        })
      }

    setFood((prevState) => {
      let updatedFood = [...prevState];
      updatedFood[index] = json;
      return updatedFood;
    });
  }

  async function fetchActivityDescriptions() {
    for (let i = 0; i< activities.length; i++) {
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
  async function fetchActivityDescription(activity, index) {
    setLoading((prev) => ({
      days: true,
      dayTrips: prev.dayTrips,
    }));
      const response = await fetch("/api/generateActivityDescription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({location: activity.name, city: locationName})
      });
     
      const responseData = await response.json();
      if (response.status !== 200) {
        throw responseData.error || new Error(`Request failed with status ${response.status}`);
      }

    const jsonStr = JSON.parse(responseData).result;
    if (!isJsonString(jsonStr)) {
      return;
    }
    const json = JSON.parse(jsonStr);
    if (json.error) {
      setErrorMessages((prevState) => {
        return nextState = [...prevState, json.error]
      })
    }

    setActivities((prevState) => {
      let updatedActivities = [...prevState];
      updatedActivities[index].long_desc = json.long_desc;
      updatedActivities[index].short_desc = json.short_desc;
      return updatedActivities;
    });
  }

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
    setLoading((prev) => ({
      days: true,
      dayTrips: prev.dayTrips,
    })); 
    fetchImage(neighborhood, index);
    const response = await fetch("/api/generateTour", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ neighborhood: neighborhood.name, city: locationName}),
    });
    const responseData = await response.json();
      if (response.status !== 200) {
        throw responseData.error || new Error(`Request failed with status ${response.status}`);
      }

      const jsonStr = JSON.parse(responseData).result;
      if (!isJsonString(jsonStr)) {
        return;
      } 
      const json = JSON.parse(jsonStr);
      if (json.error) {
        setErrorMessages((prevState) => {
          return nextState = [...prevState, json.error]
        })
      }
      setNeighborhoods((prevState) => {
        let updatedNeighborhoods = [...prevState];
        updatedNeighborhoods[index].walking_tour = json;
        return updatedNeighborhoods;
      });
  }

  async function fetchImage(neighborhood, index) {
    if (!neighborhoods || neighborhoods.length === 0) return;
    try {
      const response = await fetch("/api/fetchUnsplashImage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ locationName, neighborhood: neighborhood.name })
    });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      let updatedNeighborhoods = neighborhoods;
      updatedNeighborhoods[index].image = data.images[0];
      setNeighborhoods(updatedNeighborhoods);
    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error);
    }
  }

  function initializeItineraryStates() {
    const initActivities = Array.from({length: tripLength}, () => ({
      name:"",
      short_desc:"",
      long_desc:"",
      image: {}
    }));

    const initNeighborhoods = Array.from({length: tripLength}, () => ({
      name: "",
      walking_tour: [],
      image: {}
    }));

    const initFood = Array.from({length: tripLength}, () => ({
      lunch: {name:"", desc:""},
      dinner: {name:"", desc:""}
    }));

    const initDayTrips = Array.from({length: 2}, () =>  ({
      name: "",
      short_desc: "",
      long_desc: "",
      food: {}
    }));
    setDayTrips(initDayTrips);
    setActivities(initActivities);
    setNeighborhoods(initNeighborhoods);
    setFood(initFood)
  }

  function checkCanDownload() {
    const shouldDownloadDisable = (locationName && loading.callCount === 0)
    shouldDownloadDisable ? setIsDownloadButtonDisabled(true) : setIsDownloadButtonDisabled(false);
  }
  /*****************
  * FORM FUNCTIONS
  ******************/

  async function onDownload(event) {
    event.preventDefault();
    if (!locationName) {
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
          city: locationName,
          neighborhoods: neighborhoods,
          activities: activities,
          foods: food,
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

  async function onSubmit(event) {
    setLoading({
      activities:true,
      dayTrips: true,
    });
    event.preventDefault();

    initializeItineraryStates();
    fetchMeta();
    setIsDownloadButtonDisabled(false);

    scrollTo(myRef);
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
      </Head>
        <main className={styles.main }>
          <div className={styles.hero}>
            <div className={styles.input}>
              <img src="/JourneyGenieLogo_thick.png" className={styles.icon} />
              <h1>TRIPPIN</h1>
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

                <div className={styles.select}>
                  <label forhtml="tripLength">How long are you there?</label>
                  <select 
                    name="tripLength" 
                    id="tripLength"
                    defaultValue={tripLength}
                    onChange={(e) => setTripLength(parseInt(e.target.value))}
                  >
                    <option value="1">1 Day</option>
                    <option value="2">2 Days</option>
                    <option value="3">3 Days</option>
                    <option value="4">4 Days</option>
                    <option value="5">5 Days</option>
                  </select>
                </div>


                <p>Why are you traveling?</p>
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
                {renderLoader()}
              </form>
              {errorMessages}
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
          <div className={styles.result} ref={myRef}>
            {locationName ? <h4>Travel Plan for <span className={styles.cityName}> {locationName} </span></h4> : ""}
            {renderDays()}
            <DayTrips
              dayTrips={dayTrips}
              locationName={locationName}
              retry={retryDayTrip}
            />
          </div>
          {isOpen && <DownloadModal onClose={onModalCloseClick}/>}


        </main>
    </div>
  );
}
