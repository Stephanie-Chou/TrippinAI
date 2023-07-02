import { Configuration } from "openai";
import { NextApiRequest, NextApiResponse } from "next";
import { OpenAIStream, OpenAIStreamPayload} from "./OpenAIStream";
import { Redis } from '@upstash/redis'
import { getStreamResponse } from "../../utils/getStreamResponse";
import isJsonString from "../../utils/isJsonString";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function (req: NextApiRequest, res: NextApiResponse): Promise<string> {
  const { location, city } = req.body
  console.log("Day Trip for", city, location);


  /** Check cache */
  const client = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

const key: string = `dayTrip:city:${city.toLowerCase()}:location:${location.toLowerCase()}`;  
const cached = await client.get(key);

if (cached) {
  console.log('CACHE HIT', JSON.stringify(cached));
  res.status(200).json(JSON.stringify(cached));
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
  const prompt: string = generateDayTripPrompt(city, location);

  if (!prompt) {
    res.status(400).json({message: "No prompt in the request"});
  }
  const payload: OpenAIStreamPayload = {
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

    getStreamResponse(data).then((streamResponse: string) => {
      console.log('CACHE MISS', JSON.stringify({result: streamResponse}))
      if (isJsonString(streamResponse)) {
        client.set(key, JSON.stringify({result: streamResponse}));
        res.status(200).json(JSON.stringify({result: streamResponse}));
      }
      res.status(500).json(JSON.stringify({error: "Invalid JSON returned"}));
    });
};

// generate a list of day trips from a city.
function generateDayTripPrompt(city: string, location: string): string {
  const capitalizedCity =
    city[0].toUpperCase() + city.slice(1).toLowerCase();
    return `A json string for a day trip to ${location} from ${city}

    location: Rome Pompeii
    day_trip: {
      "name":"Pompeii",
      "short_desc":"ancient roman town destroyed by volcano",
      "long_desc": " "
      "food": {}
    }
    
    location: Rome Almalfi Coast
    day_trip: {    
      "name":"Almalfi Coast",
      "short_desc":"Breathtaking coastal paradise with colorful cliffside towns and turquoise waters.",
      "long_desc": " "
      "food": {}
    }
    
    location: Seattle Olympic National Park
    day_trip: {
      "name":"Olympic National Park",
      "short_desc":"Immerse yourself in a diverse natural wonderland on the Olympic Peninsula.",
      "long_desc": " "
      "food": {}
    }
    location: Seattle Mount Rainier National Park
    day_trip:  {
      "name":"Mount Rainier National Park",
      "short_desc":"xperience the splendor of a towering volcano and alpine wilderness.",
      "long_desc": " "
      "food": {}
    }

    location: ${capitalizedCity} ${location}
    day_trip:
    `;
}