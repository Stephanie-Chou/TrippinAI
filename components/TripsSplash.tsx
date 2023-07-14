import { ReactElement } from "react";
import CanvasBackground from "../components/CanvasBackground";
import styles from "../pages/about.module.css";
import PageWrapper from "../components/PageWrapper";

export default function TripsSplash(): ReactElement {
  return (
    <PageWrapper>
      <div className={styles.about}>
        <CanvasBackground>
          <div className={styles.canvas_contents}>
            <div className={styles.textLogo}><img src="/Trippintextlogo.svg" alt="Trippin Text Logo" /></div>
            <div className={styles.aboutText}>
              <h4>Trips</h4>
              <p>Are you looking for the trip you shared? Check your emails for the link.</p>
              <p>Want to create a new trip? Get inspired, <a href="/">Get Trippin</a>.</p>
            </div>
            <img className={styles.splashBanner} src="/Trippinsplashbanner.svg" alt="Trippin Splash Banner: Let's Get Trippin." />
          </div>

        </CanvasBackground>
      </div>
    </PageWrapper>

  )
}