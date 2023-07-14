import { ReactElement } from "react";
import SplashPage from "../components/SplashPage";

export default function Custom404(): ReactElement {
  return (
    <SplashPage>
      <h2>404 - No Trips Here</h2>
      {/* <p>Are you looking for the trip you shared? Check your emails for the link.</p> */}
      <p>Want to create a new trip? Get inspired, <a href="/">Get Trippin</a>.</p>
    </SplashPage>
  )
}