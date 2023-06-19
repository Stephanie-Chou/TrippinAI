import { OpenAIStream} from "./OpenAIStream";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export const config = {
  runtime: "edge",
};

export default async function (req) {
  const { location } = (await req.json()) 
  console.log("generate food for ", location);
  const prompt = generateFoodPrompt(location);

  if (!prompt) {
    return new Response("No prompt in the request", { status: 400 });
  }

  if (!location ) {
    return new Response("No location provided", { status: 400});
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



function generateFoodPrompt(location) {
    
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
    Neighborhood: ${location}
    food:
  `
}