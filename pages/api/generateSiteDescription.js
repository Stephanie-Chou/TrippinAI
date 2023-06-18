import { OpenAIStream} from "./OpenAIStream";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export const config = {
  runtime: "edge",
};

export default async function (req) {
  const { location, interests } = (await req.json()) 
  console.log("generate site description for ", location, interests);
  const prompt = generateSiteDescriptionPrompt(location, interests);

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
    max_tokens: 400,
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



function generateSiteDescriptionPrompt(location, interests) {
    
    return `I am a tourist visiting a location. I want to learn something about the location that matches my interests. My interests are ${interests}. provide a paragraph ofr 50-60 words describing the location.

    City: Rome
    interests: Adventure
    description: Rome, a city of adventure, offers thrilling experiences like witnessing the fascinating remnants of early Christian and pagan burial practices in the catacombs, biking along the Appian Way, and discovering hidden gems in its vibrant neighborhoods. Embark on thrilling adventures by exploring ancient ruins, such as the Colosseum and Roman Forum, where you can imagine the epic battles that once took place. 
    City: Rome
    interests: History
    description: Rome, the Eternal City, is a captivating blend of ancient wonders and modern vibrancy, where history comes alive at every turn. From the Colosseum to the Roman Forum, immerse yourself in the rich tapestry of Rome's iconic landmarks and archaeological treasures. The Romans built over 50,000 miles of roads, connecting their vast empire and facilitating trade, communication, and military movements. 
    City: Rome
    interests: Off the Beaten Path
    description: Discover Rome's offbeat activities: explore street art in Ostiense, visit the non-Catholic Cemetery, or take a bike tour along the ancient Appian Way.
    City: Rome
    interests: food
    description: Rome, a gastronomic paradise, tempts food lovers with its mouthwatering pizza, pasta, gelato, and world-class culinary scene. One interesting fact about Roman food is the use of "garum," a fermented fish sauce, as a popular condiment in ancient Roman cuisine. Garum was made by fermenting fish guts and salt and was used to enhance the flavors of various dishes
    City: Rome
    interests: general
    description: 
    Rome, the Eternal City, home to the Colosseum and Vatican City, offers a blend of ancient wonders and religious treasures, captivating visitors with its 2,500-year-old history.
    City: ${location}
    interests: ${interests}
    description:`
}

// "Step into the grandeur of Ancient Rome at the Colosseum, the largest amphitheater ever built. Discover the history of gladiators, explore the vast arena, and marvel at the architectural masterpiece that has stood for centuries.",
// "Immerse yourself in the vibrant atmosphere of Trastevere at Piazza Santa Maria in Trastevere. Admire the beautiful Basilica of Santa Maria in Trastevere, relax at a café while people-watching, and soak up the lively energy of this picturesque square.",
// "Established in 1907, Pike Place Market is one of the oldest continuously operated public farmers' markets in the U.S. It offers an exciting blend of local produce, fresh seafood, specialty foods, artisan crafts, and lively atmosphere.",
// "Seattle's Volunteer Park is a peaceful urban escape, where visitors can enjoy the beauty of a Victorian-style conservatory, walk along scenic paths, and admire panoramic views from the historic water tower. It's a perfect spot to unwind and connect with nature in the heart of the city.",
// "A quirky public art installation in Seattle's Fremont neighborhood, featuring a massive troll sculpture clutching a real-life Volkswagen Beetle under a bridge. It's a must-see for visitors seeking unique and playful attractions.",
