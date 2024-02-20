import { OpenAIStream, OpenAIStreamPayload } from "./OpenAIStream";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export const config = {
  runtime: "edge",
};

export default async function (req: Request): Promise<Response> {
  const { city } = (await req.json());
  const prompt: string = generateTravelDayPrompt(city);

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
    max_tokens: 500,
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
function generateTravelDayPrompt(location: string): string {
  return ` I am a traveler going to ${location}. Give advice specific to ${location}. Assume the traveler is not local. Give instructions on how to get to ${location}. Give practical tips about whether to rent a car, use public transportation or some other private transportation in ${location}. Provide the information as a list. Add a new line character, \n, between each step of the list. Limit the response to 150 words total or less. Do not include information unrelated to transportation

  location: New York City
  result:
    <h4>Getting to New York City</h4>
    <ul>
      <li> Fly to one of the three major airports: John F. Kennedy International Airport (JFK), LaGuardia Airport (LGA), or Newark Liberty International Airport (EWR).</li>
      <li> Take a bus, train, or taxi from the airport to your destination.</li>
    </ul>

    <h4>Getting around</h4>
    <ul>
      <li> Consider renting a car if you are traveling outside of Manhattan and need more flexibility.</li>
      <li> Make use of public transportation (NYC Subway and buses) for easy access to most of the city. </li>
      <li> Take advantage of private transportation services like Uber, Lyft, or Via. </li>
      <li> Investigate the possibility of renting a bike to explore the city.</li>
    </ul>

  location: ${location}
  result:
  `;
}