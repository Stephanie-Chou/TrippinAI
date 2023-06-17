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

  const prompt = generateDayTripPrompt(city);

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

// generate a list of day trips from a city.
function generateDayTripPrompt(city) {
  const capitalizedCity =
    city[0].toUpperCase() + city.slice(1).toLowerCase();
    return `A json string of 2 day trips

    City: Rome
    day_trips: {
      "day_trips":[
        {
          "name":"pompeii",
          "short_desc":"ancient roman town destroyed by volcano",
          "long_desc":"Pompeii, a once thriving roman city near modern day napes was frozen in time when it was buried under volcanic ash during the eruption of Mount vesuvius in 79 AD",
          "food":{
            "name":"Frittura Napoletana",
            "desc":"Naples is known for its delicious street food, It consists of a variety of fried goodies"
          }
        },
        {
          "name":"Almalfi Coast",
          "short_desc":"Breathtaking coastal paradise with colorful cliffside towns and turquoise waters.",
          "long_desc":"The Amalfi Coast is a picturesque stretch of coastline in southern Italy, renowned for its dramatic cliffs, charming seaside towns, and crystal-clear waters. With its colorful architecture, scenic landscapes, and Mediterranean charm, it's a dream destination for beach lovers and romantics alike",
          "food":{
            "name":"Lemon Delights",
            "desc":"Try the famous lemon-based treats of the Amalfi Coast, such as refreshing limoncello liqueur, tangy lemon sorbet, and delectable lemon cake"
          }
        }]
    }
    City: Seattle
    day_trips: {
      "day_trips":[
        {
          "name":"Olympic National Park",
          "short_desc":"Immerse yourself in a diverse natural wonderland on the Olympic Peninsula.",
          "long_desc":"Discover enchanting trails, pristine lakes, and abundant wildlife. From the dramatic coastline of Rialto Beach to the picturesque beauty of Hurricane Ridge, this day trip promises awe-inspiring landscapes and unforgettable adventures.",
          "food":{
            "name":"The Station House Cafe",
            "desc":"Port Angeles, from fresh seafood specialties to mouthwatering burgers, their menu offers a delightful blend of flavors"
          }
        },
        {
          "name":"Mount Rainier National Park",
          "short_desc":"xperience the splendor of a towering volcano and alpine wilderness.",
          "long_desc":"Explore scenic trails that wind through wildflower-dotted landscapes and encounter breathtaking vistas. This day trip offers an immersive experience in the pristine alpine wilderness surrounding the iconic Mount Rainier.",
          "food":{
            "name":"Copper Creek Inn Restaurant",
            "desc":"Near the park entrance, indulge in their hearty mountain fare, including their famous blackberry pie"
          }
        }
      ]
    }
    City: ${capitalizedCity}
    day_trips:
    `;
}

/*
sample response
{
  "day_trips":[
    {
      "name":"Snoqualmie Falls",
      "short_desc":"Witness the power of nature at one of the most iconic waterfalls in the Pacific Northwest.",
      "long_desc":"Snoqualmie Falls is a breathtaking 270-foot waterfall located in the foothills of the Cascade Mountains. Take in the majestic beauty of this natural wonder and enjoy a picnic lunch in the lush forest surroundings.",
      "food":{
        "name":"Salish Lodge & Spa",
        "desc":"Enjoy a delicious meal at Salish Lodge & Spa, located just steps away from the falls. Their award-winning cuisine features local ingredients and regional specialties"
      }
    },
    {
      "name":"Seattle Waterfront",
      "short_desc":"Explore the vibrant waterfront of Seattle.",
      "long_desc":"Stroll along the Seattle Waterfront and take in the lively sights and sounds of the city. Browse the local crafts and souvenirs in the shops, then grab a bite to eat at one of the many eateries that line the waterfront.",
      "food":{
        "name":"The Crab Pot",
        "desc":"Feast on a variety of seafood specialties, such as their famous seafood platters featuring fresh-caught Dungeness crab, clams, mussels, and shrimp"
      }
    }
  ]
}
*/