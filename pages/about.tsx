import { ReactElement } from "react";
import CanvasBackground from "../components/CanvasBackground";
import styles from "./about.module.css";
import PageWrapper from "../components/PageWrapper";

export default function About(): ReactElement {
  return (
    <PageWrapper>
      <div className={styles.about}>
        <CanvasBackground>
          <div className={styles.canvas_contents}>
            <div className={styles.textLogo}><img src="/Trippintextlogo.svg" alt="Trippin Text Logo" /></div>
            <div className={styles.aboutText}>
              <h4>About Us</h4>
              <p>Trippin is more than just a travel app—We're your personal trip curator. Powered by AI, Trippin creates tailor-made multi-day itineraries filled with exciting activities, hidden gems, culinary delights, and captivating day trips. No more hours spent researching and planning; we do the work for you. Whether you're a first-time traveler seeking inspiration or a seasoned explorer looking for fresh ideas, we've got you covered.</p>
              <p>Get inspired, <a href="/">Get Trippin</a>.</p>

              <h4>✨ Features</h4>

              <ul>
                <li>One to five Day Itineraries for any location in the world. Complete with suggested sites, activities and food recs</li>
                <li>Day Trip recommendations</li>
                <li>Travel Day recommendations: How to get there and what transportation to use when you are in the city</li>
                <li>What to Eat recommendations: What's the regional cuisine, what neighborhoods are foodie paradises and what not to miss.</li>
                <li>Where to Stay recommendations: whether you want to feel like a local or be as close to the classic tourist spots as possible - we got you covered</li>
                <li>Cater your results to your interests using our filters for Family Friendly Fun, Food, Adventure, Culture, History and  Party Time 🎉</li>
                <li>Share PDF versions of your Trippin Plans.</li>
              </ul>

            </div>
            <img className={styles.splashBanner} src="/Trippinsplashbanner.svg" alt="Trippin Splash Banner: Let's Get Trippin." />
          </div>

        </CanvasBackground>
      </div>
    </PageWrapper>

  )
}