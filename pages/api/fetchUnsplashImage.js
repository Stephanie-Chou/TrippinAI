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

  const locationName = req.body.locationName || '';
  const site = req.body.site || '';
  console.log('fetching image for ' , site, locationName);
  const query = site+ ' ' + locationName;
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