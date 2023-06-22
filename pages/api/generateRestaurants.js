import { Configuration } from "openai";
import { OpenAIStream} from "./OpenAIStream";
import { Redis } from '@upstash/redis'
import { getStreamResponse } from "../utils/getStreamResponse";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function (req, res) {
  const { neighborhood, city } = req.body
  console.log("generate food for ", neighborhood);

  
  /** Check cache */
  const client = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })

  const key = `food:location:${neighborhood.toLowerCase()}:city:${city.toLowerCase()}`;  
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

  const prompt = generateFoodPrompt(neighborhood, city);


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

function generateFoodPrompt(neighborhood) {
  
    return `Given a neighborhood, recommend a lunch and dinner place to eat with description. Should return valid JSON.

    Neighborhood: Pike Place Market
    food: {
        "lunch": {"name": "Pike Place Chowder", "desc": "Indulge in delicious and hearty chowders featuring fresh local ingredients."},
        "dinner": {"name": "Matt's in the Market", "desc": "Enjoy seasonal and locally sourced dishes in a cozy setting above Pike Place Market."}
    }
    Neighborhood: Fremont
    food: {
        "lunch": {"name": "Paseo Caribbean Food", "desc": "Savor mouthwatering Caribbean sandwiches filled with flavorful marinated meats and spices."},
        "dinner": {"name": "Revel", "desc": "Experience innovative Korean-inspired cuisine in a trendy setting."}
    }
    Neighborhood: Capitol Hill
    food: {
        "lunch": {"name": "Stateside", "desc": "Enjoy a fusion of French and Vietnamese flavors, with dishes like banh mi and crispy duck rolls."},
        "dinner": {"name": "Canon", "desc": "Delight in craft cocktails and an extensive whiskey selection at this award-winning bar and restaurant."}
    }
    Neighborhood: Ancient Rome
    food: {
        "lunch": { "name":  "Trattoria da Lucia", "desc":"Indulge in traditional Roman cuisine, including pasta, pizza, and classic Roman dishes."},
        "dinner": { "name":  "Osteria Barberini", "desc":"Experience authentic Roman flavors in a cozy and welcoming atmosphere."}
    }
    Neighborhood: ${neighborhood}
    food:
  `;
}
