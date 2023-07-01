import { createApi } from "unsplash-js";
const configuration = {accessKey: process.env.UNSPLASH_ACCESS_KEY}
const api = createApi(configuration);

export default async function (req, res) {
  if (!configuration.accessKey) {
    res.status(500).json({
      error: {
        message: "Unsplash key not configured",
      }
    });
    return;
  }

  const city = req.body.city || '';
  const site = req.body.site || '';
  console.log('fetching image for ' , site, city);
  const query = site+ ' ' + city;
    try{
      const images = await api.search.getPhotos({
        query: query,
        orientation: "landscape",
        perPage: 1
      });
      res.status(200).json({images: images.response.results});
    }catch(error){
      console.log(error);
    }
}