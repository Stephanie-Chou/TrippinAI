import { OpenAIStream} from "./OpenAIStream";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export const config = {
  runtime: "edge",
};

export default async function (req) {
  const { neighborhood, tourStops } = (await req.json()) 
    console.log(neighborhood, tourStops)
  const prompt = generateWalkingTourPrompt(neighborhood, tourStops);

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
    max_tokens: 200,
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



function generateWalkingTourPrompt(neighborhood, tourStops) {
    
    return `Given an array of tour stops and the associated neighborhood, return a JSON string with the name of the stop and a short description of the stop.
  
    tourStops: Vatican City [St. Peter's Basilica, Vatican Gardens, Castel Sant'Angelo]
    walking_tour: [
        {"name": "St. Peter's Basilica", "desc":"Discover the largest church in the world, known for its breathtaking architecture and religious significance."},
        {"name": "Vatican Gardens", "desc":"Stroll through the beautifully landscaped gardens, filled with lush greenery, fountains, and sculptures."},
        {"name": "Castel Sant'Angelo", "desc":"Visit this ancient fortress and former papal residence, offering panoramic views of Rome from its terrace."}
    ]
    tourStops: Fremont [Fremont Sunday Market, Gas Works Park, Theo Chocolate Factory]
    walking_tour: [ 
        {"name": "Fremont Sunday Market", "desc": "Browse the eclectic mix of crafts, vintage items, and local produce at this vibrant open-air market."},
        {"name": "Gas Works Park", "desc": "Enjoy panoramic views of the Seattle skyline and explore the unique industrial remnants of a gasification plant turned park."},
        {"name": "Theo Chocolate Factory", "desc": "Take a guided tour of the organic and fair-trade chocolate factory, and indulge in delicious samples."}
      ]
    tourStops: ${neighborhood} ${tourStops},
    walking_tour:
    `
}