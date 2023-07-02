import { OpenAIStream, OpenAIStreamPayload} from "./OpenAIStream";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export const config = {
  runtime: "edge",
};

export default async function (req: Request): Promise<Response> {
  const { city, interests, currentActivities } = (await req.json());
  const prompt: string = generateActivityPrompt(city, interests, currentActivities);

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
        // since we don't use browser's EventSource interface, specifying content-type is optional.
        // the eventsource-parser library can handle the stream response as SSE, as long as the data format complies with SSE:
        // https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#sending_events_from_the_server
        
        // 'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      })
    }
  );
};

// generate a list of activities in a city
function generateActivityPrompt(city: string, interests: string, currentActivities: string[]): string {
  if (!interests) {
    interests = "general"
  }
    return `I am a tourist visiting a location. Want an alternative activity to the ${currentActivities}. the new activity should be relevant to my interests. My interests are ${interests}. each activity should include the neighborhood where it is located. Return valid JSON containing the activity and the neighborhood

    City: Seattle
    interests: Off the Beaten Path
    current activities:  ["Georgetown Art Attack", "Fremont Sunday Market"]
    return: {
      "activity": "Waterfall Garden Park",
      "neighborhood": "Pioneer Square"
    }

    City: Rome
    interests: Off the Beaten Path
    current activities: ["Exploring the Appian Way", "Visiting the Centrale Montemartini Museum", "Discovering the Coppedè District", "Touring the Doria Pamphilj Gallery"]
    return: {
      "activity": "The Oltrarno District",
      "neighborhood": "Oltrarno"
    }
  

    City: Seattle
    interests: History
    current activities: ["Underground Tour", "Museum of History & Industry (MOHAI)", "Klondike Gold Rush National Historical Park"]
    return: {
      "activity": "Wing Luke Museum of the Asian Pacific American Experience",
      "neighborhood": "Chinatown-International District"
    }

    City: Seattle
    interests: culture
    current activities: ["Seattle Art Museum (SAM)", "Chihuly Garden and Glass", "Wing Luke Museum of the Asian Pacific American Experience"]
    return: {
      "activity": "Museum of Pop Culture",
      "neighborhood": "Seattle Center"
    }

    City: Seattle
    interests: food
    current activities: ["Pike Place Market", "Food tour on Capitol Hill", "Ballard Farmers Market"]
    return: {
      "activity": "Fremont Brewery Tour",
      "neighborhood": "Fremont"
    }
  
    City: Seattle
    interests: general
    current activities: ["Pike Place Market", "Underground Tour", "Chihuly Garden and Glass"]
    return: {
      "activity": "Golden Gardens Park",
      "neighborhood": "Ballard"
    }
  
    City: ${city}
    interests: ${interests}
    current activities: ${currentActivities}
    return:
  `;
}