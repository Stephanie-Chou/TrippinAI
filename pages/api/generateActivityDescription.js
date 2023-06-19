import { OpenAIStream} from "./OpenAIStream";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export const config = {
  runtime: "edge",
};

export default async function (req) {
  const { location, city } = (await req.json()) 
  console.log("generate site description for ", location, city);
  const prompt = generateActivityDescriptionPrompt(location, city);

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
    max_tokens: 400,
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



function generateActivityDescriptionPrompt(location, city) {
    
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
  `
}

// "Step into the grandeur of Ancient Rome at the Colosseum, the largest amphitheater ever built. Discover the history of gladiators, explore the vast arena, and marvel at the architectural masterpiece that has stood for centuries.",
// "Immerse yourself in the vibrant atmosphere of Trastevere at Piazza Santa Maria in Trastevere. Admire the beautiful Basilica of Santa Maria in Trastevere, relax at a café while people-watching, and soak up the lively energy of this picturesque square.",
// "Established in 1907, Pike Place Market is one of the oldest continuously operated public farmers' markets in the U.S. It offers an exciting blend of local produce, fresh seafood, specialty foods, artisan crafts, and lively atmosphere.",
// "Seattle's Volunteer Park is a peaceful urban escape, where visitors can enjoy the beauty of a Victorian-style conservatory, walk along scenic paths, and admire panoramic views from the historic water tower. It's a perfect spot to unwind and connect with nature in the heart of the city.",
// "A quirky public art installation in Seattle's Fremont neighborhood, featuring a massive troll sculpture clutching a real-life Volkswagen Beetle under a bridge. It's a must-see for visitors seeking unique and playful attractions.",
