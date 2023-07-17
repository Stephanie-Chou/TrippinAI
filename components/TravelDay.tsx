import { TRAVEL_DAY_ID } from "../utils/constants";
import Page from "./Page";
import styles from "./day.module.css";
import { ReactElement } from "react";

export default function TravelDay({ locationName, travelTips, image }): ReactElement {

  let urls = !image ? { regular: '' } : image.urls;
  let user = !image ? { username: '', name: '' } : image.user;
  let username: string = !user ? '' : user.username
  const subheader: string = "Travel Day";
  const markup = { __html: travelTips };
  return (
    <>
      {travelTips && <Page
        header={locationName}
        subheader={subheader}
        id={TRAVEL_DAY_ID}
      >
        <div
          className={styles.day_description}
          dangerouslySetInnerHTML={markup}
        />

        {urls ? <img className={styles.image} src={urls.regular} /> : null}
        <a
          className={styles.credit}
          target="_blank"
          href={`https://unsplash.com/@${username}?utm_source=TrippinAI&utm_medium=referral`}
        >{user ? user.name : ''}</a> on <a className={styles.credit} href="https://unsplash.com?utm_source=TrippinAI&utm_medium=referral">Unsplash</a>
      </Page>}
    </>
  );
}