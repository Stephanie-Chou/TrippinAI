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
  const { location, city } = req.body
  console.log("generate food for ", location);


  /** Check cache */
  const client = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })

  const key: string = `food:location:${location.toLowerCase()}:city:${city.toLowerCase()}`;
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

  const prompt: string = generateFoodPrompt(location, city);

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

function generateFoodPrompt(location: string, city: string) {

  return `Given a location, recommend a regional specialty or commonly found food with a description. pick a recommendation for lunch and one for dinner. Should return valid JSON.

    location: Pike Place Market Seattle
    food: {
      "lunch": {"name": "Pike Place Chowder","desc": "Known for their award-winning chowders, this casual eatery offers delicious clam chowder, seafood bisque, and other comforting soups."},
      "dinner": {"name": "The Pink Door","desc": "A popular Italian-American restaurant with a lively atmosphere, serving dishes like handmade pasta and fresh seafood."}
    }
    location: Ballard Seattle
    food: {
      "lunch": {"name": "Ballard Pizza Company","desc": "This local pizzeria offers a variety of delicious wood-fired pizzas with creative toppings in a laid back setting."},
      "dinner": {"name": "The Walrus and the Carpenter","desc": "his popular oyster bar offers a delightful selection of fresh oysters, seafood dishes, and craft cocktails."}
    }
    location: Naples
    food: {
        "lunch": {"name": "Pizza Napoletana", "desc": "Naples is the birthplace of pizza, and Pizza Napoletana is a true Neapolitan specialty. Enjoy a thin, soft, and chewy crust topped with fresh ingredients like San Marzano tomatoes, buffalo mozzarella, and basil."},
        "dinner": {"name": "Neapolitan Pasta", "desc": "Classic pasta dishes from Naples include spaghetti alle vongole (spaghetti with clams), pasta alla puttanesca (pasta with tomatoes, olives, capers, and anchovies), and spaghetti alle cozze (spaghetti with mussels)."}
    }
    location: Ancient Rome Rome
    {
      "lunch": {"name": "Ristorante il Matriciano","desc": "A renowned restaurant serving authentic Roman cuisine, including classic dishes like amatriciana and coda alla vaccinara."},
      "dinner": {"name": "Enoteca Corsi","desc": "A traditional Roman wine bar and restaurant where you can enjoy local wines, antipasti platters, and hearty pasta dishes."}
    }
    location: ${location} ${city}
    food:
  `;
}
