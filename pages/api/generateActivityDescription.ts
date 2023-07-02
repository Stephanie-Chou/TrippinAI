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
  console.log("generate site description for ", location, city);
  
  /** Check cache */
  const client = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })

  const key: string = `activityDescriptions:location:${location.toLowerCase()}:city:${city.toLowerCase()}`;  
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

  const prompt: string = generateActivityDescriptionPrompt(location, city);

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
    return;
  }

  getStreamResponse(data).then((streamResponse: string) => {
    console.log('CACHE MISS', JSON.stringify({result: streamResponse}))
    if (isJsonString(streamResponse)) {
      client.set(key, JSON.stringify({result: streamResponse}));
      res.status(200).json(JSON.stringify({result: streamResponse}));
      return;
    }
    res.status(500).json(JSON.stringify({error: "Invalid JSON returned"}));
  });
}

function generateActivityDescriptionPrompt(location: string, city: string): string {
  
    return `I am a tourist visiting a location in a city. I want to learn something about the location. provide a long description- paragraph ofr 50-60 words describing the location. also provide a short description of 5-10 words.

    Location: Colosseum Rome
    description: {
      "short_desc": "Iconic amphitheater of Ancient Rome, known for gladiatorial contests.",
      "long_desc": "Step into the grandeur of Ancient Rome at the Colosseum, the largest amphitheater ever built. Discover the history of gladiators, explore the vast arena, and marvel at the architectural masterpiece that has stood for centuries."
    }
    Location: Vatican Museums Rome
    description: {
      "short_desc": "World-renowned art collection, including the Sistine Chapel.",
      "long_desc": "Explore the vast art collection of the Vatican Museums, housing masterpieces from different periods and cultures. Marvel at the stunning frescoes in the Sistine Chapel painted by Michelangelo and admire works by renowned artists like Raphael and Leonardo da Vinci."
    }
    Location: Pike Place Market Seattle
    description: {
      "short_desc": " Historic farmers' market known for fresh produce, seafood, and eclectic shops.",
      "long_desc": "Established in 1907, Pike Place Market is one of the oldest continuously operated public farmers' markets in the U.S. It offers an exciting blend of local produce, fresh seafood, specialty foods, artisan crafts, and lively atmosphere."
    }
    Location: Fremont Troll Seattle
    description: {
      "short_desc":"Seattle's iconic under-bridge troll sculpture.",
      "long_desc": " A quirky public art installation in Seattle's Fremont neighborhood, featuring a massive troll sculpture clutching a real-life Volkswagen Beetle under a bridge. It's a must-see for visitors seeking unique and playful attractions."
    }
    Location: ${location} ${city}
    description:
  `;
}
