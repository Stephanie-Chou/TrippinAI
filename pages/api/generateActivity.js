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
      prompt: generateActivityPrompt(city),
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

// generate a list of activities in a city
function generateActivityPrompt(city) {
  const capitalizedCity =
    city[0].toUpperCase() + city.slice(1).toLowerCase();
    return `A json string including the top 3 sites to see in a city as well as 2 recommended day trips for a first time tourist. JSON object should contain activities, an array of activity objects. The JSON object should also contain day_trips, an array of day_trip objects.

    City: Rome
    itinerary: {
      "activities":[
        {
          "day": "1",
          "neighborhood": "Ancient Rome",
          "site": "Colosseum",
          "short_desc": "Iconic amphitheater of Ancient Rome, known for gladiatorial contests.",
          "long_desc": "Step into the grandeur of Ancient Rome at the Colosseum, the largest amphitheater ever built. Discover the history of gladiators, explore the vast arena, and marvel at the architectural masterpiece that has stood for centuries.",
          "walking_tour": [
            {
              "name": "Roman Forum",
              "desc":"Immerse yourself in the ruins of the political and social center of Ancient Rome, filled with temples, basilicas, and ancient buildings."
            },
            {
              "name": "Palatine Hill",
              "desc":"Explore the birthplace of Rome's civilization and enjoy panoramic views of the city from this historic hill."
            },
            {
              "name": "Circus Maximus",
              "desc":"Wander through the ancient chariot racing stadium and imagine the excitement of the games that once took place here."
            }
          ],
          "food": {
            "lunch": {
              "name":  "Trattoria da Lucia",
              "desc":"Indulge in traditional Roman cuisine, including pasta, pizza, and classic Roman dishes."
            },
            "dinner": {
              "name":  "Osteria Barberini",
              "desc":"Experience authentic Roman flavors in a cozy and welcoming atmosphere."
            }
          }
        },
        {
          "day": "2",
          "neighborhood": "Vatican City",
          "site": "Vatican Museums",
          "short_desc": "World-renowned art collection, including the Sistine Chapel.",
          "long_desc": "Explore the vast art collection of the Vatican Museums, housing masterpieces from different periods and cultures. Marvel at the stunning frescoes in the Sistine Chapel painted by Michelangelo and admire works by renowned artists like Raphael and Leonardo da Vinci.",
          "walking_tour": [
            {
              "name": "St. Peter's Basilica",
              "desc":"Discover the largest church in the world, known for its breathtaking architecture and religious significance."
            },
            {
              "name": "Vatican Gardens",
              "desc":"Stroll through the beautifully landscaped gardens, filled with lush greenery, fountains, and sculptures."
            },
            {
              "name": "Castel Sant'Angelo",
              "desc":"Visit this ancient fortress and former papal residence, offering panoramic views of Rome from its terrace."
            }
          ],
          "food": {
            "lunch": {
              "name":  "Ristorante il Fico",
              "desc":"Enjoy a delightful Italian meal with fresh ingredients and a charming ambiance near the Vatican."
            },
            "dinner":{
              "name":  "Hostaria Romana",
              "desc":"Indulge in classic Roman dishes, including cacio e pepe and saltimbocca alla romana."
            }
          }
        },
        {
          "day":"3",
          "neighborhood": "Trastevere",
          "site": "Piazza Santa Maria in Trastevere",
          "short_desc": "Lively square in the charming Trastevere neighborhood.",
          "long_desc": "Immerse yourself in the vibrant atmosphere of Trastevere at Piazza Santa Maria in Trastevere. Admire the beautiful Basilica of Santa Maria in Trastevere, relax at a café while people-watching, and soak up the lively energy of this picturesque square.",
          "walking_tour": [
            {
              "name": "Villa Farnesina",
              "desc":"Explore this Renaissance villa adorned with exquisite frescoes by renowned artists like Raphael."
            },
            {
              "name": "Gianicolo Hill",
              "desc":"Climb to the top of this hill for stunning views of Rome's skyline and the opportunity to witness the traditional midday cannon firing."
            },
            {
              "name": "Isola Tiberina",
              "desc":"Cross the Tiber River to reach this charming island and take a leisurely stroll along its picturesque streets."
            }
          ],
          "food": {
            "lunch":{
              "name":  "Da Enzo al 29",
              "desc":"Taste authentic Roman cuisine with homemade pasta and traditional dishes in the heart"
            },
            "dinner": {
              "name": "La Tavernaccia",
              "desc": "known for its traditional Roman cuisine and warm ambiance."
            }
        }
      }
    ]
    }
    City: Seattle
    itinerary: {
      "activities": [{
        "day":"1",
        "neighborhood": "Pike Place Market",
        "site": "Pike Place Market",
        "short_desc": " Historic farmers' market known for fresh produce, seafood, and eclectic shops.",
        "long_desc": "Established in 1907, Pike Place Market is one of the oldest continuously operated public farmers' markets in the U.S. It offers an exciting blend of local produce, fresh seafood, specialty foods, artisan crafts, and lively atmosphere.",
        "walking_tour": [
          {"name": "Seattle Waterfront", "desc" :"Take a stroll along the waterfront, enjoying views of Elliott Bay and exploring attractions like the Seattle Aquarium."},
          {"name": "Post Alley", "desc" :"Wander through the charming Post Alley, known for its quirky shops, street art, and the famous Gum Wall."},
          {"name": "Seattle Art Museum (SAM)","desc" :"Visit the renowned art museum and explore its diverse collection spanning contemporary art to ancient artifacts."}
        ],
        "food":{
          "lunch": {"name": "Pike Place Chowder", "desc": "Indulge in delicious and hearty chowders featuring fresh local ingredients."},
          "dinner": {"name": "Matt's in the Market", "desc": "Enjoy seasonal and locally sourced dishes in a cozy setting above Pike Place Market."}
        }
      },
      {
        "day":"2",
        "neighborhood": "Fremont",
        "site": "Fremont Troll",
        "short_desc":"Seattle's iconic under-bridge troll sculpture.",
        "long_desc": " A quirky public art installation in Seattle's Fremont neighborhood, featuring a massive troll sculpture clutching a real-life Volkswagen Beetle under a bridge. It's a must-see for visitors seeking unique and playful attractions.",
        "walking_tour": [
          {"name": "Fremont Sunday Market", "desc": "Browse the eclectic mix of crafts, vintage items, and local produce at this vibrant open-air market."},
          {"name": "Gas Works Park", "desc": "Enjoy panoramic views of the Seattle skyline and explore the unique industrial remnants of a gasification plant turned park."},
          {"name": "Theo Chocolate Factory", "desc": "Take a guided tour of the organic and fair-trade chocolate factory, and indulge in delicious samples."}
        ],
        "food":{
          "lunch": {"name": "Paseo Caribbean Food", "desc": "Savor mouthwatering Caribbean sandwiches filled with flavorful marinated meats and spices."},
          "dinner": {"name": "Revel", "desc": "Experience innovative Korean-inspired cuisine in a trendy setting."}
        }
      },
      {
        "day":"3",
        "neighborhood": "Capitol Hill",
        "site": "Volunteer Park",
        "short_desc":"Serene urban park with water tower viewpoint.",
        "long_desc":"Seattle's Volunteer Park is a peaceful urban escape, where visitors can enjoy the beauty of a Victorian-style conservatory, walk along scenic paths, and admire panoramic views from the historic water tower. It's a perfect spot to unwind and connect with nature in the heart of the city.",
        "walking_tour": [
          {"name": "Broadway Avenue", "desc": "Explore the bustling heart of Capitol Hill, lined with trendy boutiques, cafes, and vibrant nightlife."},
          {"name": "Volunteer Park Conservatory", "desc": "Discover the beautiful Victorian-style glasshouse, showcasing a diverse collection of plants from around the world."},
          {"name": "Elliott Bay Book Company", "desc": "Get lost in the stacks of this iconic independent bookstore, known for its extensive selection and cozy reading nooks."}
        ],
        "food":{
          "lunch": {"name": "Stateside", "desc": "Enjoy a fusion of French and Vietnamese flavors, with dishes like banh mi and crispy duck rolls."},
          "dinner": {"name": "Canon", "desc": "Delight in craft cocktails and an extensive whiskey selection at this award-winning bar and restaurant."}
        }
      }],
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
    itinerary:`;
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
