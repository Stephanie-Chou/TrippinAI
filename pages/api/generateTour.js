import { Configuration } from "openai";
import { OpenAIStream} from "./OpenAIStream";
import { Redis } from '@upstash/redis'
import { getStreamResponse } from "../utils/getStreamResponse";
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function (req, res) {
  const { neighborhood, city } = req.body

  console.log("generate walking tour for ", neighborhood, city);

  /** Check cache */
  const client = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })

  const key = `walkingTour:neighborhood:${neighborhood.toLowerCase()}:city:${city.toLowerCase()}`;
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

  const prompt = generateWalkingTourPrompt(neighborhood);

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
    max_tokens: 200,
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

    client.set(key, JSON.stringify({result: streamResponse}));
    return res.status(200).json(JSON.stringify({result: streamResponse}));
  });
}

function generateWalkingTourPrompt(neighborhood) {
  
    return `Given a neighborhood, return a suggeseted walking tour with 3 stops. return a JSON string with the name of stop and a short description of the stop.
  
    tourStops: Vatican City
    walking_tour: [
        {"name": "St. Peter's Basilica", "desc":"Discover the largest church in the world, known for its breathtaking architecture and religious significance."},
        {"name": "Vatican Gardens", "desc":"Stroll through the beautifully landscaped gardens, filled with lush greenery, fountains, and sculptures."},
        {"name": "Castel Sant'Angelo", "desc":"Visit this ancient fortress and former papal residence, offering panoramic views of Rome from its terrace."}
    ]
    tourStops: Fremont
    walking_tour: [ 
        {"name": "Fremont Sunday Market", "desc": "Browse the eclectic mix of crafts, vintage items, and local produce at this vibrant open-air market."},
        {"name": "Gas Works Park", "desc": "Enjoy panoramic views of the Seattle skyline and explore the unique industrial remnants of a gasification plant turned park."},
        {"name": "Theo Chocolate Factory", "desc": "Take a guided tour of the organic and fair-trade chocolate factory, and indulge in delicious samples."}
      ]
    tourStops: ${neighborhood}
    walking_tour:
    `;
}
