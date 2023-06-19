import { OpenAIStream} from "./OpenAIStream";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export const config = {
  runtime: "edge",
};

export default async function (req) {
  const { city, interests } = (await req.json()) 
  console.log(city, interests);

  const prompt = generateActivityPrompt(city, interests);

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
function generateActivityPrompt(city, interests) {
  if (!interests) {
    interests = "general"
  }
  const capitalizedCity =
    city[0].toUpperCase() + city.slice(1).toLowerCase();
    return `I am a tourist visiting a location. I want a list of 3 activities to do in that location that are relevant to my interests. My interests are ${interests}. each activity should include the neighborhood where it is located. Return valid JSON containing the activities and the neighborhoods
    City: Seattle
    interests: History
    return: {
      "activities": ["Underground Tour", "Museum of History & Industry (MOHAI)", "Klondike Gold Rush National Historical Park"],
      "neighborhoods": ["Pioneer Square", "South Lake Union (SLU)", "Downtown Seattle"]
    }
  
    City: Seattle
    interests: Off the Beaten Path
    return: {
      "activities": ["Georgetown Art Attack", "Waterfall Garden Park", "Fremont Sunday Market"],
      "neighborhoods": ["Georgetown", "Pioneer Square", "Fremont"]
    }
  
    City: Seattle
    interests: food
    return: {
      "activities": ["Pike Place Market", "Food tour on Capitol Hill", "Ballard Farmers Market"],
      "neighborhoods": ["Pike Place Market", "Capitol Hill", "Ballard"]
    }
  
    City: Seattle
    interests: culture
    return: {
      "activities": ["Seattle Art Museum (SAM)", "Chihuly Garden and Glass", "Wing Luke Museum of the Asian Pacific American Experience"],
      "neighborhoods": ["Downtown Seattle", "Seattle Center", "Industrial District"]
    }

    City: Seattle
    interests: general
    return: {
      "activities": ["Pike Place Market", "Underground Tour", "Chihuly Garden and Glass"],
      "neighborhoods": ["Pike Place Market", "Pioneer Square", "Seattle Center"]
    }
  
    City: ${city}
    interests: ${interests}
    return:
  `;
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