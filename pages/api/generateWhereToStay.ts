import { OpenAIStream, OpenAIStreamPayload } from "./OpenAIStream";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export const config = {
  runtime: "edge",
};

export default async function (req: Request): Promise<Response> {
  const { city } = (await req.json());
  const prompt: string = generateWhereToStayPrompt(city);

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
    max_tokens: 760,
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
function generateWhereToStayPrompt(location: string): string {
  return ` I am a traveler going to ${location}. Recommend neighborhoods in the location to stay in. Give a reason why someone would stay there. Give a reason why that neighborhood might not be suitable to someone. Categorize the neighborhoods by: First Time Visitors, Feel like a Local, Budget Friendly, 

  location: Chicago
  result:
    <h4>First Time Visitors</h4>
    <b>Downtown / The Loop</b>
    <br>
    <div>Reason to stay</div>
    <div>Central location with easy access to popular attractions like Millennium Park, Art Institute of Chicago, and Magnificent Mile.</div>
    <br> <div>Not suitable for</div>
    <div>Travelers on a tight budget, as downtown accommodations can be relatively expensive.</div>
    <br>
    <b>River North</b>
    <br>
    <div>Reason to stay</div>
    <div>Vibrant neighborhood known for its art galleries, trendy restaurants, and nightlife. Close to Magnificent Mile and Navy Pier.</div>
    <br><div>Not suitable for</div>
    <div>Those seeking a quiet residential experience or budget-friendly options.</div>
    <br>
    <h4>Feel like a Local</h4>
    <b>Wicker Park</b>
    <br>
    <div>Reason to stay</div>
    <div>Hip and eclectic neighborhood with independent boutiques, vintage shops, music venues, and a lively dining and bar scene.</div>
    <br><div>Not suitable for</div>
    <div>Travelers looking for a more touristy and central location.</div>
    <br>
    <b>Logan Square</b>
    <br>
    <div>Reason to stay</div>
    <div>Trendy neighborhood with a thriving arts scene, unique shops, diverse dining options, and access to beautiful parks.</div>
    <br><div>Not suitable for</div>
    <div>Visitors seeking proximity to downtown attractions or a bustling nightlife.</div>
    <br>
    <h4>Budget Friendly</h4>
    <b>Lakeview</b>
    <br>
    <div>Reason to stay</div>
    <div>Affordable accommodation options, diverse dining choices, proximity to Lake Michigan, and access to Wrigley Field.</div>
    <br><div>Not suitable for</div>
    <div>Those looking for a central location or seeking a luxurious experience.</div>
    <br>
    <b>Pilsen</b>
    <br>
    <div>Reason to stay</div>
    <div>A vibrant neighborhood with a rich Hispanic heritage, vibrant street art, affordable eateries, and cultural events.</div>
    <br><div>Not suitable for</div>
    <div>Travelers prioritizing proximity to downtown attractions or seeking upscale accommodations.</div>
  
  location: ${location}
  result:
  `;
}