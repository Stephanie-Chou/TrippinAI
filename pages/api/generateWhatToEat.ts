import { OpenAIStream, OpenAIStreamPayload } from "./OpenAIStream";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export const config = {
  runtime: "edge",
};

export default async function (req: Request): Promise<Response> {
  const { city } = (await req.json());
  const prompt: string = generateWhatToEatPrompt(city);

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
function generateWhatToEatPrompt(location: string): string {
  return ` I am a traveler going to ${location}. I want to plan what to eat on my trip. Provide concise recommendations for what cuisine to try. Include Regional specialties, options for vegetarians and and neighborhoods popular for food with locals. keep descriptions conscise.

  location: Chicago
  result:

  <h4>Regional Specialties</h4>
  <ul>
    <li><b>Deep-Dish Pizza</b> Iconic Chicago-style deep-dish pizza at renowned pizzerias like Lou Malnati's, Giordano's, or Pequod's. It's a must-try regional specialty.</li>
    <li><b>Chicago Hot Dog</b> Indulge in a classic Chicago-style hot dog with all the fixings, including mustard, onions, relish, tomato slices, pickle spear, sport peppers, and celery salt.</li>
    <li><b>Chicago-style Popcorn</b> Chicago's famous caramel and cheese popcorn mix, a unique and delicious snack. Garrett Popcorn Shops has multiple locations</li>
    <li><b>Rainbow Cone</b> This ice cream cone features layers of different flavors, including chocolate, strawberry, Palmer House (New York vanilla with cherries and walnuts), pistachio, and orange sherbet. Get your fix at the Original Rainbow Cone stand in Beverly.</li>
  </ul>
  <h4>Neighborhoods</h4>
  <ul>
    <li><b>Chinatown</b> Visit Chicago's vibrant Chinatown neighborhood for authentic Chinese cuisine, including dim sum, Szechuan dishes, and a variety of regional specialties.</li>
    <li><b>Little Italy</b> Explore the historic Little Italy neighborhood for traditional Italian cuisine, such as pasta, pizza, and hearty Italian-American dishes.</li>
    <li><b>Pilsen</b> This neighborhood is known for its vibrant Mexican food scene. Enjoy delicious tacos, tamales, and other Mexican specialties at local taquerias and restaurants.</li>
  </ul>
  <h4>Alternative Diets</h4>
  <ul>
    <li>Check out neighborhoods like Wicker Park and Logan Square, which offer numerous vegetarian and vegan-friendly restaurants.</li>
    <li>Explore places like The Chicago Diner, Upton's Breakroom, or Amitabul for plant-based delights.</li>
  </ul>

  location: ${location}
  result:
  `;
}