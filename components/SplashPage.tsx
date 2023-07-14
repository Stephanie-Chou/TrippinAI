import { ReactElement } from "react";
import CanvasBackground from "../components/CanvasBackground";
import PageWrapper from "../components/PageWrapper";
import styles from "./splashpage.module.css";

export default function SplashPage({ children }): ReactElement {
  return (
    <PageWrapper>
      <div className={styles.splash}>
        <CanvasBackground>
          <div className={styles.canvas_contents}>
            <div className={styles.textLogo}><img src="/Trippintextlogo.svg" alt="Trippin Text Logo" /></div>
            <div className={styles.splashTextContainer}>
              {children}
            </div>
            <img className={styles.splashBanner} src="/Trippinsplashbanner.svg" alt="Trippin Splash Banner: Let's Get Trippin." />
          </div>

        </CanvasBackground>
      </div>
    </PageWrapper>
  )
}