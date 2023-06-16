import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  const city = req.body.city || '';
  if (city.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid city",
      }
    });
    return;
  }

  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generateDayTripPrompt(city),
      max_tokens: 1659,
      temperature: 0.6,
    });
    res.status(200).json({ result: completion.data.choices[0].text });
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}


// generate a list of day trips from a city.
function generateDayTripPrompt(city) {
  const capitalizedCity =
    city[0].toUpperCase() + city.slice(1).toLowerCase();
    return `A json string of 2 day trips

    City: Rome
    day_trips: {
      "day_trips":[
        {
          "name":"pompeii",
          "short_desc":"ancient roman town destroyed by volcano",
          "long_desc":"Pompeii, a once thriving roman city near modern day napes was frozen in time when it was buried under volcanic ash during the eruption of Mount vesuvius in 79 AD",
          "food":{
            "name":"Frittura Napoletana",
            "desc":"Naples is known for its delicious street food, It consists of a variety of fried goodies"
          }
        },
        {
          "name":"Almalfi Coast",
          "short_desc":"Breathtaking coastal paradise with colorful cliffside towns and turquoise waters.",
          "long_desc":"The Amalfi Coast is a picturesque stretch of coastline in southern Italy, renowned for its dramatic cliffs, charming seaside towns, and crystal-clear waters. With its colorful architecture, scenic landscapes, and Mediterranean charm, it's a dream destination for beach lovers and romantics alike",
          "food":{
            "name":"Lemon Delights",
            "desc":"Try the famous lemon-based treats of the Amalfi Coast, such as refreshing limoncello liqueur, tangy lemon sorbet, and delectable lemon cake"
          }
        }]
    }
    City: Seattle
    day_trips: {
      "day_trips":[
        {
          "name":"Olympic National Park",
          "short_desc":"Immerse yourself in a diverse natural wonderland on the Olympic Peninsula.",
          "long_desc":"Discover enchanting trails, pristine lakes, and abundant wildlife. From the dramatic coastline of Rialto Beach to the picturesque beauty of Hurricane Ridge, this day trip promises awe-inspiring landscapes and unforgettable adventures.",
          "food":{
            "name":"The Station House Cafe",
            "desc":"Port Angeles, from fresh seafood specialties to mouthwatering burgers, their menu offers a delightful blend of flavors"
          }
        },
        {
          "name":"Mount Rainier National Park",
          "short_desc":"xperience the splendor of a towering volcano and alpine wilderness.",
          "long_desc":"Explore scenic trails that wind through wildflower-dotted landscapes and encounter breathtaking vistas. This day trip offers an immersive experience in the pristine alpine wilderness surrounding the iconic Mount Rainier.",
          "food":{
            "name":"Copper Creek Inn Restaurant",
            "desc":"Near the park entrance, indulge in their hearty mountain fare, including their famous blackberry pie"
          }
        }
      ]
    }
    City: ${capitalizedCity}
    day_trips:
    `;
}
