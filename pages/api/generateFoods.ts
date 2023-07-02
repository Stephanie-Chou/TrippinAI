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
  console.log("generate food for ", location);

  
  /** Check cache */
  const client = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })

  const key: string = `food:location:city:${city.toLowerCase()}:${location.toLowerCase()}`;  
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

  const prompt: string = generateFoodPrompt(location, city);

  if (!prompt) {
    res.status(400).json({
      error: {
        message: "No prompt in the request"
      }
    });
  }

  const payload: OpenAIStreamPayload = {
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

  getStreamResponse(data).then((streamResponse: string) => {
    console.log('CACHE MISS', JSON.stringify({result: streamResponse}))

    if (isJsonString(streamResponse)) {
      client.set(key, JSON.stringify({result: streamResponse}));
      res.status(200).json(JSON.stringify({result: streamResponse}));
    }
    res.status(500).json(JSON.stringify({error: "Invalid JSON returned"}));
  });
}

function generateFoodPrompt(location, city) {

    return `Given a location, recommend a regional specialty or commonly found food with a description. pick a recommendation for lunch and one for dinner. Should return valid JSON.

    location: Pike Place Market Seattle
    food: {
      "lunch": {"name": "Seattle-style Clam Chowder","desc": "Enjoy a bowl of rich and creamy Seattle-style Clam Chowder, featuring fresh clams, potatoes, onions, celery, and bacon. It's a comforting and flavorful lunch option that captures the essence of the city's maritime heritage."},
      "dinner": {"name": "Pacific Northwest Salmon","desc": "Savor the iconic Pacific Northwest Salmon, known for its incredible flavor and melt-in-your-mouth texture. Grilled, baked, or pan-seared, this local specialty showcases the region's pristine waters and sustainable seafood practices."}
    }
    location: Ballard Seattle
    food: {
      "lunch": {"name": "Salmon Burger","desc": "A regional specialty of Seattle, the Salmon Burger features a juicy salmon patty served on a bun with various toppings and sauces. It showcases the fresh flavors of the Pacific Northwest."},
      "dinner": {"name": "Dungeness Crab","desc": "Indulge in the local favorite of Dungeness Crab, a sweet and succulent seafood delicacy. Enjoy it steamed, cracked, and served with melted butter for a truly satisfying dinner experience."}
    }
    location: Naples
    food: {
        "lunch": {"name": "Pizza Napoletana", "desc": "Naples is the birthplace of pizza, and Pizza Napoletana is a true Neapolitan specialty. Enjoy a thin, soft, and chewy crust topped with fresh ingredients like San Marzano tomatoes, buffalo mozzarella, and basil."},
        "dinner": {"name": "Neapolitan Pasta", "desc": "Classic pasta dishes from Naples include spaghetti alle vongole (spaghetti with clams), pasta alla puttanesca (pasta with tomatoes, olives, capers, and anchovies), and spaghetti alle cozze (spaghetti with mussels)."}
    }
    location: Ancient Rome Rome
    {
      "lunch": {"name": "Cacio e Pepe","desc": "A classic Roman pasta dish made with pecorino cheese and black pepper."},
      "dinner": {"name": "Saltimbocca alla Romana","desc": "Thin slices of veal topped with prosciutto and sage, cooked in white wine and butter."}
    }
    location: ${location} ${city}
    food:
  `;
}
