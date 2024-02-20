import { Configuration } from "openai";
import { NextApiRequest, NextApiResponse } from "next";
import { OpenAIStream, OpenAIStreamPayload } from "./OpenAIStream";
import { Redis } from '@upstash/redis'
import { getStreamResponse } from "../../utils/getStreamResponse";
import isJsonString from "../../utils/isJsonString";
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function (req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { neighborhood, city, interests } = req.body

  console.log("generate walking tour for ", neighborhood, city);

  /** Check cache */
  const client = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })

  const key: string = `walkingTour:neighborhood:${neighborhood.toLowerCase()}:city:${city.toLowerCase()}:interests:${interests}`;
  const cached = await client.get(key);


  if (cached) {
    console.log('CACHE HIT', JSON.stringify(cached));
    res.status(200).json(JSON.stringify(cached));
    return;
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

  const prompt: string = generateWalkingTourPrompt(neighborhood, interests);

  if (!prompt) {
    res.status(400).json({
      error: {
        message: "No prompt in the request"
      }
    });
  }

  const payload: OpenAIStreamPayload = {
    model: "gpt-3.5-turbo-1106",
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

  return getStreamResponse(data).then((streamResponse: string) => {
    console.log('CACHE MISS', JSON.stringify({ result: streamResponse }))

    if (isJsonString(streamResponse)) {
      client.set(key, JSON.stringify({ result: streamResponse }));
      return res.status(200).json(JSON.stringify({ result: streamResponse }));
    }
    return res.status(500).json(JSON.stringify({ error: "Invalid JSON returned" }));
  });
}

function generateWalkingTourPrompt(neighborhood: string, interests: string) {

  return `Given a neighborhood and interests, return a suggested set of 3 activities relevant to the interests. return a JSON string with the name of stop and a short description of the stop.
  
    neighborhood: Vatican City
    interests: history
    walking_tour: [
        {"name": "St. Peter's Basilica", "desc":"Discover the largest church in the world, known for its breathtaking architecture and religious significance."},
        {"name": "Vatican Gardens", "desc":"Stroll through the beautifully landscaped gardens, filled with lush greenery, fountains, and sculptures."},
        {"name": "Castel Sant'Angelo", "desc":"Visit this ancient fortress and former papal residence, offering panoramic views of Rome from its terrace."}
    ]
    neighborhood: Fremont
    interests: family friendly fun
    walking_tour: [ 
        {"name": "Fremont Sunday Market", "desc": "Browse the eclectic mix of crafts, vintage items, and local produce at this vibrant open-air market."},
        {"name": "Gas Works Park", "desc": "Enjoy panoramic views of the Seattle skyline and explore the unique industrial remnants of a gasification plant turned park."},
        {"name": "Theo Chocolate Factory", "desc": "Take a guided tour of the organic and fair-trade chocolate factory, and indulge in delicious samples."}
      ]

    neighborhood: Fremont
    interests: party time
    walking_tour: [
      {"name": "Dance at Nectar Lounge", "desc": "Enjoy live music and DJs at Nectar Lounge, a popular venue in Fremont known for its energetic atmosphere and diverse lineup of performers."},
      {"name": "Bar hopping on Fremont Ave", "desc": "Embark on a bar-hopping adventure along Fremont Avenue. From craft breweries to laid-back cocktail lounges, there's a different vibe for any occasion."},
      {"name": "Join the Fremont Solstice Parade", "desc": "If you're lucky enough to visit during the summer, don't miss the iconic Fremont Solstice Parade."}
    ]
    neighborhood: ${neighborhood}
    interests: ${interests}
    walking_tour:
    `;
}
