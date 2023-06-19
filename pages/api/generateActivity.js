import { OpenAIStream} from "./OpenAIStream";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export const config = {
  runtime: "edge",
};

export default async function (req) {
  const { city, interests, tripLength } = (await req.json());
  console.log(city, interests, tripLength);

  const prompt = generateActivityPrompt(city, interests, tripLength);

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
function generateActivityPrompt(city, interests, tripLength) {
  if (!interests) {
    interests = "general"
  }
  const capitalizedCity =
    city[0].toUpperCase() + city.slice(1).toLowerCase();
    return `I am a tourist visiting a location. I want a list of ${tripLength} activities to do in that location that are relevant to my interests. My interests are ${interests}. each activity should include the neighborhood where it is located. Return valid JSON containing the activities and the neighborhoods
    City: Seattle
    interests: History
    tripLength: 3
    return: {
      "activities": ["Underground Tour", "Museum of History & Industry (MOHAI)", "Klondike Gold Rush National Historical Park"],
      "neighborhoods": ["Pioneer Square", "South Lake Union (SLU)", "Downtown Seattle"]
    }
  
    City: Seattle
    interests: Off the Beaten Path
    tripLength: 2
    return: {
      "activities": ["Georgetown Art Attack", "Fremont Sunday Market"],
      "neighborhoods": ["Georgetown", "Fremont"]
    }
  
    City: Seattle
    interests: food
    tripLength: 4
    return: {
      "activities": ["Pike Place Market", "Food tour on Capitol Hill", "Ballard Farmers Market", "Fremont Brewery Tour"],
      "neighborhoods": ["Pike Place Market", "Capitol Hill", "Ballard", "Fremont"]
    }
  
    City: Seattle
    interests: culture
    tripLength: 3
    return: {
      "activities": ["Seattle Art Museum (SAM)", "Chihuly Garden and Glass", "Wing Luke Museum of the Asian Pacific American Experience"],
      "neighborhoods": ["Downtown Seattle", "Seattle Center", "Industrial District"]
    }

    City: Seattle
    interests: general
    tripLength: 5
    return: {
      "activities": ["Pike Place Market", "Underground Tour", "Chihuly Garden and Glass", "Seattle Art Museum (SAM)", "Golden Gardens Park"],
      "neighborhoods": ["Pike Place Market", "Pioneer Square", "Seattle Center", "Downtown Seattle", "Ballard"]
    }
  
    City: ${city}
    interests: ${interests}
    return:
  `;
}