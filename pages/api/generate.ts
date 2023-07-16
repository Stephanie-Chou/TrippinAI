import { OpenAIStream, OpenAIStreamPayload } from "./OpenAIStream";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export const config = {
  runtime: "edge",
};

export default async function (req: Request): Promise<Response> {
  const { city, interests, tripLength } = (await req.json());

  console.log(city, tripLength, interests,);

  const prompt: string = generatePrompt(city, interests, tripLength);

  console.log(`finding ${tripLength} activities for ${interests} in ${city}`)

  if (!prompt) {
    return new Response("No prompt in the request", { status: 400 });
  }

  const payload: OpenAIStreamPayload = {
    model: "text-davinci-003",
    prompt: prompt,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 1659,
    stream: true,
    n: 1,
  };

  const stream = await OpenAIStream(payload);
  // return stream response (SSE)
  return new Response(
    stream, {
    headers: new Headers({
      // 'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    })
  }
  );
};

// generate a list of activities in a city
function generatePrompt(city: string, interests: string, tripLength: number): string {
  return `Given a trip destination, trip length and your interests, recommend a list of concise activities or attractions during your visit. Provide a corresponding list of locations (neighborhood) where the activity can be done. Both lists should be limited to ${tripLength} items.
  
  
  Destination: [Insert destination here]
  Interests: [Describe what you want to do, see, or experience]
  Trip Length: [How many days are you going]
 
  return: {
    "activities": ["Suggested activity or attraction 1", "Suggested activity or attraction 2", "Suggested activity or attraction 3", ... "Suggested activity or attraction ${tripLength}"],
    "locations": ["Location 1", "Location 2", "Location 3", ... "Location ${tripLength}"]

  }
    
  
  Destination: ${city}
  Interests: ${interests}
  Trip Length: ${tripLength}
  return:
  `;
}