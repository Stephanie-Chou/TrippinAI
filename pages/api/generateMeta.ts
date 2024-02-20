import { OpenAIStream, OpenAIStreamPayload } from "./OpenAIStream";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export const config = {
  runtime: "edge",
};

export default async function (req: Request): Promise<Response> {
  const { city, interests, tripLength } = (await req.json());
  const prompt: string = generateActivityPrompt(city, interests, tripLength);

  console.log(`finding ${tripLength} activities for ${interests} in ${city}`)

  if (!prompt) {
    return new Response("No prompt in the request", { status: 400 });
  }

  const payload: OpenAIStreamPayload = {
    model: "gpt-3.5-turbo-1106",
    prompt: prompt,
    temperature: 1,
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
function generateActivityPrompt(city: string, interests: string, tripLength: number): string {
  return `You are a helpful travel assistant.  I am a tourist visiting ${city}. My interests are ${interests}. Provide an array of ${tripLength} activity names to do and/or attraction names to visit in ${city}. These activities and or attractions should be relevant to my interests. Provide recommendations that are seasonally relevant. Do NOT provide descriptions.
  Also, provide an array of length ${tripLength} which corresponds to the neighborhood where the activity or attraction can be found.
  In addition, return 2 dayTrip location name suggestions which are within a day's journey of the ${city}. Return valid JSON containing the activities and the neighborhoods and dayTrips. number of activities should equal the trip length ${tripLength}

    destination: Destination such as Seattle
    interests: List of interests such as Adventure, Food, Relaxation
    tripLength: ${tripLength}
    return: {
      "activities": ["Activity or Attraction 1", "Activity or Attraction 2", "Activity or Attraction 3", ... "Activity or Attraction ${tripLength}"],
      "neighborhoods": ["neighborhood 1", "neighborhood 2", "neighborhood 3", ... "neighborhood ${tripLength}"],
      "dayTrips": ["Day Trip name 1", "Day Trip name 2"]
    }

    destination: ${city}
    interests: ${interests}
    tripLength: ${tripLength}
    return:
  `;
}