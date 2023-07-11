import Head from "next/head";

import { ReactElement } from "react";
import styles from "./pagewrapper.module.css";

export default function PageWrapper({ children }): ReactElement {
  return (
    <div>
      <Head>
        <title>Trippin - The AI Powered Travel Planner</title>
        <link rel="icon" href="/JourneyGenieLogo_thick.png" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" />
        <meta property="og:image" content="https://stephaniechou.com/assets/images/trippinspo_logo.png"></meta>
        <meta name="description" content="Artificial Intelligence powered travel planner. Creates a one to five day itinerary, Recommends Day Trips and Food options. Get inspired for your next vacation." />
        <meta name="_foundr" content="f785866cc563749ca77fcae47d19fb96"></meta>
      </Head>
      <main className={styles.main}>
        {children}

      </main>
      <footer className={styles.footer}>
        <div>Trippin Created by SugarJie Studios</div>
      </footer>
    </div>
  );
}