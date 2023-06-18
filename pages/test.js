import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";

export default function Test() {
  const interests = ["Food", "Off the beaten path", "Adventure", "History"];

  const [testInput, setTestInput] = useState("");
  const [result, setResult] = useState();
  const [checkedState, setCheckedState] = useState(
    interests.map((interest) => ({name: interest, isChecked: false}))
);



async function onSubmit(event) {
    event.preventDefault();

    const interests = checkedState.map((item) => item.isChecked? item.name : "").filter((n)=>n).join()
    try {
      const response = await fetch("/api/generateTest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: testInput, interests: interests }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setResult(data.result);
      setTestInput("");
    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
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
        <title>OpenAI Quickstart</title>
      </Head>

      <main className={styles.main}>
        <h3>Test Prompts</h3>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="city"
            placeholder="Enter a city"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
          />

          Interests

          {
            interests.map((interest, index) => {
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
          <input type="submit" value="Generate Result" />
        </form>
        <div className={styles.result}>{result}</div>
      </main>
    </div>
  );
}


	        /**
    * let sample_response ={
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

    const activities = sample_response.activities; // list of activity objects
    const dayTrips = sample_response.day_trips; // list of daytrip ojects
    setActivities(activities);
    setDayTrips(dayTrips);
*/







/*

June 17 15:00
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