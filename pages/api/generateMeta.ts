import { OpenAIStream, OpenAIStreamPayload} from "./OpenAIStream";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export const config = {
  runtime: "edge",
};

export default async function (req: Request): Promise<Response> {
  const { city, interests, tripLength } = (await req.json());
  const prompt: string = generateActivityPrompt(city, interests, tripLength);

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
function generateActivityPrompt(city: string, interests: string, tripLength: number): string {
  if (!interests) {
    interests = "general"
  }
    return `I am a tourist visiting a location. I want a list of ${tripLength} activities to do in that location that are relevant to my interests. My interests are ${interests}. each activity should include the neighborhood where it is located. In addition, return 2 day trip location suggestions. Return valid JSON containing the activities and the neighborhoods and day trips

    City: Seattle
    interests: Off the Beaten Path
    tripLength: 1
    return: {
      "activities": ["Waterfall Garden Park"],
      "neighborhoods": ["Pioneer Square"],
      "dayTrips": ["Bainbridge Island", "Snoqualmie Falls"]
    }

    City: Seattle
    interests: Adventure
    tripLength: 1
    return: {
      "activities": ["Waterfall Garden Park"],
      "neighborhoods": ["Pioneer Square"],
      "dayTrips": ["Snoqualmie Peak", "Olympic National Park"]
    }

    City: Rome
    interests: Off the Beaten Path
    tripLength: 1
    return: {
      "activities": ["The Oltrarno District"],
      "neighborhoods": ["Oltrarno"],
      "dayTrips": ["Ostia Antica", "Tivoli"]
    }
  
    City: Seattle
    interests: Off the Beaten Path
    tripLength: 2
    return: {
      "activities": ["Georgetown Art Attack", "Fremont Sunday Market"],
      "neighborhoods": ["Georgetown", "Fremont"],
      "dayTrips": ["Boeing Factory, Everett", "Hoh Rainforest, Olympic National Park"]
    }

    City: Seattle
    interests: History
    tripLength: 3
    return: {
      "activities": ["Underground Tour", "Museum of History & Industry (MOHAI)", "Klondike Gold Rush National Historical Park"],
      "neighborhoods": ["Pioneer Square", "South Lake Union (SLU)", "Downtown Seattle"],
      "dayTrips": ["Port Townsend", "Poulsbo"]

    }

    City: Seattle
    interests: culture
    tripLength: 3
    return: {
      "activities": ["Seattle Art Museum (SAM)", "Chihuly Garden and Glass", "Wing Luke Museum of the Asian Pacific American Experience"],
      "neighborhoods": ["Downtown Seattle", "Seattle Center", "Industrial District"],
      "dayTrips": ["Leavenworth" , "Bainbridge Island"]
    }

    City: Seattle
    interests: food
    tripLength: 4
    return: {
      "activities": ["Pike Place Market", "Food tour on Capitol Hill", "Ballard Farmers Market", "Fremont Brewery Tour"],
      "neighborhoods": ["Pike Place Market", "Capitol Hill", "Ballard", "Fremont"],
      "dayTrips": ["Leavenworth", "Woodinville Wine Country"]
    }
  
    City: Seattle
    interests: general
    tripLength: 5
    return: {
      "activities": ["Pike Place Market", "Underground Tour", "Chihuly Garden and Glass", "Seattle Art Museum (SAM)", "Golden Gardens Park"],
      "neighborhoods": ["Pike Place Market", "Pioneer Square", "Seattle Center", "Downtown Seattle", "Ballard"],
      "dayTrips": ["Mt. Rainier National Park", "San Juan Islands"]
    }
  
    City: ${city}
    interests: ${interests}
    tripLength: ${tripLength}
    return:
  `;
}