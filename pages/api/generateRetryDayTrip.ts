import { OpenAIStream, OpenAIStreamPayload } from "./OpenAIStream";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export const config = {
  runtime: "edge",
};

export default async function (req: Request): Promise<Response> {
  const { city, interests, currentTrips } = (await req.json());
  const prompt: string = generateDayTripPrompt(city, interests, currentTrips);

  if (!prompt) {
    return new Response("No prompt in the request", { status: 400 });
  }

  const payload: OpenAIStreamPayload = {
    model: "gpt-3.5-turbo-1106",
    prompt: prompt,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 30,
    stream: true,
    n: 1,
  };

  const stream = await OpenAIStream(payload);
  // return stream response (SSE)
  return new Response(
    stream, {
    headers: new Headers({
      'Cache-Control': 'no-cache',
    })
  }
  );
};

// generate a list of activities in a city
function generateDayTripPrompt(city: string, interests: string, currentTrips: string[]): string {
  if (!interests) {
    interests = "general"
  }
  return `I am a tourist visiting a location. Want an alternative Day Trip to the ${currentTrips}. the new Day Trip should be relevant to my interests. My interests are ${interests}.  Return the name of the day trip

    City: Rome
    interests: Off the Beaten Path
    current Trips: ["Ostia Antica", "Tivoli (Villa d'Este and Hadrian's Villa)"]
    return: Bomarzo's Sacred Grove
  

    City: Seattle
    interests: Adventure
    current Trips: ["San Juan Islands", "Hoh Rainforest in Olympic National Park"]
    return: Mount Rainier National Park

    City: Seattle
    interests: culture
    current Trips: ["Leavenworth", "Woodinville Wine Country"]
    return: Poulsbo

  
    City: ${city}
    interests: ${interests}
    current Trips: ${currentTrips}
    return:
  `;
}