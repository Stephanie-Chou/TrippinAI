import { OpenAIStream} from "./OpenAIStream";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export const config = {
  runtime: "edge",
};

export default async function (req) {
  const { city } = (await req.json()) 
  console.log(city);

  const prompt = generateActivityPrompt(city);

  if (!prompt) {
    return new Response("No prompt in the request", { status: 400 });
  }

  const payload = {
    model: "text-davinci-003",
    prompt: prompt,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 1659,
    stream: true,
    n: 1,
  };

  const stream = await OpenAIStream(payload);
  // return stream response (SSE)
  return new Response(
    stream, {
      headers: new Headers({
        // since we don't use browser's EventSource interface, specifying content-type is optional.
        // the eventsource-parser library can handle the stream response as SSE, as long as the data format complies with SSE:
        // https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#sending_events_from_the_server
        
        // 'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      })
    }
  );
};

// generate a list of activities in a city
function generateActivityPrompt(city) {
  const capitalizedCity =
    city[0].toUpperCase() + city.slice(1).toLowerCase();
    return `A valid json string including the top 3 sites to see in a city. JSON object should contain activities, an array of activity objects.

    City: Rome
    itinerary: {
      "activities":[
        {
          "day": "1",
          "neighborhood": "Ancient Rome",
          "site": "Colosseum",
          "short_desc": "Iconic amphitheater of Ancient Rome, known for gladiatorial contests.",
          "long_desc": "",
          "walking_tour": [
            {
              "name": "Roman Forum",
              "desc":""
            },
            {
              "name": "Palatine Hill",
              "desc":""
            },
            {
              "name": "Circus Maximus",
              "desc":""
            }
          ],
          "food": {
            "lunch": {
              "name":  "Trattoria da Lucia",
              "desc":"Indulge in traditional Roman cuisine, including pasta, pizza, and classic Roman dishes."
            },
            "dinner": {
              "name":  "Osteria Barberini",
              "desc":"Experience authentic Roman flavors in a cozy and welcoming atmosphere."
            }
          }
        },
        {
          "day": "2",
          "neighborhood": "Vatican City",
          "site": "Vatican Museums",
          "short_desc": "World-renowned art collection, including the Sistine Chapel.",
          "long_desc": "",
          "walking_tour": [
            {
              "name": "St. Peter's Basilica",
              "desc":""
            },
            {
              "name": "Vatican Gardens",
              "desc":""
            },
            {
              "name": "Castel Sant'Angelo",
              "desc":""
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
          "long_desc": "",
          "walking_tour": [
            {
              "name": "Villa Farnesina",
              "desc":""
            },
            {
              "name": "Gianicolo Hill",
              "desc":""
            },
            {
              "name": "Isola Tiberina",
              "desc":""
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
    ]
    }
    City: Seattle
    itinerary: {
      "activities": [{
        "day":"1",
        "neighborhood": "Pike Place Market",
        "site": "Pike Place Market",
        "short_desc": " Historic farmers' market known for fresh produce, seafood, and eclectic shops.",
        "long_desc": "",
        "walking_tour": [
          {"name": "Seattle Waterfront", "desc" :""},
          {"name": "Post Alley", "desc" :""},
          {"name": "Seattle Art Museum (SAM)","desc" :""}
        ],
        "food":{
          "lunch": {"name": "Pike Place Chowder", "desc": "Indulge in delicious and hearty chowders featuring fresh local ingredients."},
          "dinner": {"name": "Matt's in the Market", "desc": "Enjoy seasonal and locally sourced dishes in a cozy setting above Pike Place Market."}
        }
      },
      {
        "day":"2",
        "neighborhood": "Fremont",
        "site": "Fremont Troll",
        "short_desc":"Seattle's iconic under-bridge troll sculpture.",
        "long_desc": "",
        "walking_tour": [
          {"name": "Fremont Sunday Market", "desc": ""},
          {"name": "Gas Works Park", "desc": ""},
          {"name": "Theo Chocolate Factory", "desc": ""}
        ],
        "food":{
          "lunch": {"name": "Paseo Caribbean Food", "desc": "Savor mouthwatering Caribbean sandwiches filled with flavorful marinated meats and spices."},
          "dinner": {"name": "Revel", "desc": "Experience innovative Korean-inspired cuisine in a trendy setting."}
        }
      },
      {
        "day":"3",
        "neighborhood": "Capitol Hill",
        "site": "Volunteer Park",
        "short_desc":"Serene urban park with water tower viewpoint.",
        "long_desc":"",
        "walking_tour": [
          {"name": "Broadway Avenue", "desc": ""},
          {"name": "Volunteer Park Conservatory", "desc": ""},
          {"name": "Elliott Bay Book Company", "desc": ""}
        ],
        "food":{
          "lunch": {"name": "Stateside", "desc": "Enjoy a fusion of French and Vietnamese flavors, with dishes like banh mi and crispy duck rolls."},
          "dinner": {"name": "Canon", "desc": "Delight in craft cocktails and an extensive whiskey selection at this award-winning bar and restaurant."}
        }
      }]
    }
    City: ${capitalizedCity}
    itinerary:`;
}


/** 
 * {
      "activities": [{
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
      }]
    }
 */