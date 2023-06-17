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
    return `A json string including the top 3 sites to see in a city as well as 2 recommended day trips for a first time tourist. JSON object should contain activities, an array of activity objects.

    City: Rome
    itinerary: {
      "activities":[
        {
          "day": "1",
          "neighborhood": "Ancient Rome",
          "site": "Colosseum",
          "short_desc": "Iconic amphitheater of Ancient Rome, known for gladiatorial contests.",
          "long_desc": "Step into the grandeur of Ancient Rome at the Colosseum, the largest amphitheater ever built. Discover the history of gladiators, explore the vast arena, and marvel at the architectural masterpiece that has stood for centuries.",
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
          "long_desc": "Explore the vast art collection of the Vatican Museums, housing masterpieces from different periods and cultures. Marvel at the stunning frescoes in the Sistine Chapel painted by Michelangelo and admire works by renowned artists like Raphael and Leonardo da Vinci.",
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
          "long_desc": "Immerse yourself in the vibrant atmosphere of Trastevere at Piazza Santa Maria in Trastevere. Admire the beautiful Basilica of Santa Maria in Trastevere, relax at a café while people-watching, and soak up the lively energy of this picturesque square.",
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
        "long_desc": "Established in 1907, Pike Place Market is one of the oldest continuously operated public farmers' markets in the U.S. It offers an exciting blend of local produce, fresh seafood, specialty foods, artisan crafts, and lively atmosphere.",
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
        "long_desc": " A quirky public art installation in Seattle's Fremont neighborhood, featuring a massive troll sculpture clutching a real-life Volkswagen Beetle under a bridge. It's a must-see for visitors seeking unique and playful attractions.",
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
        "long_desc":"Seattle's Volunteer Park is a peaceful urban escape, where visitors can enjoy the beauty of a Victorian-style conservatory, walk along scenic paths, and admire panoramic views from the historic water tower. It's a perfect spot to unwind and connect with nature in the heart of the city.",
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


// "day_trips":[
//   {
//     "name":"Olympic National Park",
//     "short_desc":"Immerse yourself in a diverse natural wonderland on the Olympic Peninsula.",
//     "long_desc":"Discover enchanting trails, pristine lakes, and abundant wildlife. From the dramatic coastline of Rialto Beach to the picturesque beauty of Hurricane Ridge, this day trip promises awe-inspiring landscapes and unforgettable adventures.",
//     "food":{
//       "name":"The Station House Cafe",
//       "desc":"Port Angeles, from fresh seafood specialties to mouthwatering burgers, their menu offers a delightful blend of flavors"
//     }
//   },
//   {
//     "name":"Mount Rainier National Park",
//     "short_desc":"xperience the splendor of a towering volcano and alpine wilderness.",
//     "long_desc":"Explore scenic trails that wind through wildflower-dotted landscapes and encounter breathtaking vistas. This day trip offers an immersive experience in the pristine alpine wilderness surrounding the iconic Mount Rainier.",
//     "food":{
//       "name":"Copper Creek Inn Restaurant",
//       "desc":"Near the park entrance, indulge in their hearty mountain fare, including their famous blackberry pie"
//     }
//   }
// ]