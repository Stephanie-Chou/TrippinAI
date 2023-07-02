import { NextApiRequest, NextApiResponse } from "next";
import { createApi } from "unsplash-js";
import { ApiResponse } from "unsplash-js/dist/helpers/response";
import { Photos } from "unsplash-js/dist/methods/search/types/response";
const configuration = {accessKey: process.env.UNSPLASH_ACCESS_KEY}
const api = createApi(configuration);

export default async function (req: NextApiRequest, res: NextApiResponse): Promise<string> {
  if (!configuration.accessKey) {
    res.status(500).json({
      error: {
        message: "Unsplash key not configured",
      }
    });
    return;
  }

  const city: string = req.body.city || '';
  const site: string = req.body.site || '';
  console.log('fetching image for ' , site, city);
  const query: string = site+ ' ' + city;
    try{
      const images: ApiResponse<Photos> = await api.search.getPhotos({
        query: query,
        orientation: "landscape",
        perPage: 1
      });
      res.status(200).json({images: images.response.results});
    }catch(error){
      console.log(error);
    }
}