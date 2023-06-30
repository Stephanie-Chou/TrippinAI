import { Configuration } from "openai";
import { OpenAIStream} from "./OpenAIStream";
import { Redis } from '@upstash/redis'
import { getStreamResponse } from "../../utils/getStreamResponse";
import isJsonString from "../../utils/isJsonString";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function (req, res) {
  const { location, city } = req.body
  console.log("Day Trip for", city, location);


  /** Check cache */
  const client = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

const key = `dayTrip:city:${city.toLowerCase()}:location:${location.toLowerCase()}`;  
const cached = await client.get(key);

if (cached) {
  console.log('CACHE HIT', JSON.stringify(cached));
  return res.status(200).json(JSON.stringify(cached));
}

/** Cache Miss */
if (!configuration.apiKey) {
  res.status(500).json({
    error: {
      message: "OpenAI API key not configured, please follow instructions in README.md",
    }
  });
  return;
}
  const prompt = generateDayTripPrompt(city, location);

  if (!prompt) {
    return res.status(400).json({message: "No prompt in the request"});
  }
  const payload = {
    model: "text-davinci-003",
    prompt: prompt,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 400,
    stream: true,
    n: 1,
  };

  const stream = await OpenAIStream(payload);
    let response = new Response(
      stream, {
        headers: new Headers({
          // 'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
        })
      }
    );

    const data = response.body;
    if (!data) {
      console.log('no data')
      return;
    }

    return getStreamResponse(data).then((streamResponse) => {
      console.log('CACHE MISS', JSON.stringify({result: streamResponse}))
      if (isJsonString(streamResponse)) {
        client.set(key, JSON.stringify({result: streamResponse}));
        return res.status(200).json(JSON.stringify({result: streamResponse}));
      }

    });
};

// generate a list of day trips from a city.
function generateDayTripPrompt(city, location) {
  const capitalizedCity =
    city[0].toUpperCase() + city.slice(1).toLowerCase();
    return `A json string for a day trip to ${location} from ${city}

    location: Rome Pompeii
    day_trip: {
      "name":"Pompeii",
      "short_desc":"ancient roman town destroyed by volcano",
      "long_desc":"Pompeii, a once thriving roman city near modern day naples was frozen in time when it was buried under volcanic ash during the eruption of Mount vesuvius in 79 AD",
      "food":{
        "name":"Frittura Napoletana",
        "desc":"Naples is known for its delicious street food, It consists of a variety of fried goodies"
      }
    }
    
    location: Rome Almalfi Coast
    day_trip: {    
      "name":"Almalfi Coast",
      "short_desc":"Breathtaking coastal paradise with colorful cliffside towns and turquoise waters.",
      "long_desc":"The Amalfi Coast is a picturesque stretch of coastline in southern Italy, renowned for its dramatic cliffs, charming seaside towns, and crystal-clear waters. With its colorful architecture, scenic landscapes, and Mediterranean charm, it's a dream destination for beach lovers and romantics alike",
      "food":{
        "name":"Lemon Delights",
        "desc":"Try the famous lemon-based treats of the Amalfi Coast, such as refreshing limoncello liqueur, tangy lemon sorbet, and delectable lemon cake"
      }
    }
    
    location: Seattle Olympic National Park
    day_trip: {
      "name":"Olympic National Park",
      "short_desc":"Immerse yourself in a diverse natural wonderland on the Olympic Peninsula.",
      "long_desc":"Discover enchanting trails, pristine lakes, and abundant wildlife. From the dramatic coastline of Rialto Beach to the picturesque beauty of Hurricane Ridge, this day trip promises awe-inspiring landscapes and unforgettable adventures.",
      "food":{
        "name":"The Station House Cafe",
        "desc":"Port Angeles, from fresh seafood specialties to mouthwatering burgers, their menu offers a delightful blend of flavors"
      }
      
    location: Seattle Mount Rainier National Park
    day_trip:  {
      "name":"Mount Rainier National Park",
      "short_desc":"xperience the splendor of a towering volcano and alpine wilderness.",
      "long_desc":"Explore scenic trails that wind through wildflower-dotted landscapes and encounter breathtaking vistas. This day trip offers an immersive experience in the pristine alpine wilderness surrounding the iconic Mount Rainier.",
      "food":{
        "name":"Copper Creek Inn Restaurant",
        "desc":"Near the park entrance, indulge in their hearty mountain fare, including their famous blackberry pie"
      }
    }

    location: ${capitalizedCity} ${location}
    day_trip:
    `;
}