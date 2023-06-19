import Head from "next/head";
import { Fragment, useState } from "react";
import styles from "./index.module.css";

export default function Test() {
  const interests = ["Food", "Off the beaten path", "Adventure", "History"];

  const [testInput, setTestInput] = useState("");
  const [result, setResult] = useState([]);
  const [checkedState, setCheckedState] = useState(
    interests.map((interest) => ({name: interest, isChecked: false}))
  );

  const [selectState, setSelectState] = useState(3);
  const PhotoComp = ({ photo }) => {
    const { user, urls } = photo;
  
    return (
      <Fragment>
        <img src={urls.regular} />
        <a
          target="_blank"
          href={`https://unsplash.com/@${user.username}`}
        >
          {user.name}
        </a>
      </Fragment>
    );
  };
async function onSubmit(event) {
    event.preventDefault();

    const interests = checkedState.map((item) => item.isChecked? item.name : "").filter((n)=>n).join()
    try {
      const response = await fetch("/api/fetchUnsplashImage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: testInput, interests: interests, tripLength: selectState })
    });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      console.log('return data ', data);
      setResult(data.images);
      setTestInput("");
    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  const handleOnChange = (position) => {
    const updatedCheckedState = checkedState.map((item, index) =>
      index === position ? {name: item.name, isChecked: !item.isChecked} : item
    );

    setCheckedState(updatedCheckedState)
  }
  return (
    <div>
      <Head>
        <title>OpenAI Quickstart</title>
      </Head>

      <main className={styles.main}>
        <h3>Test Prompts</h3>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="city"
            placeholder="Enter a city"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
          />
          Trip length
          <label forHtml="tripLength">How many days is your trip?</label>

          <select name="tripLength" id="tripLength" onChange={(e) => setSelectState(e.target.value)}>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
          
          Interests
          {
            interests.map((interest, index) => {
              return (
                <div key={index}>
                  <input
                    type="checkbox"
                    id={`interest-checkbox-${index}`}
                    name={interest}
                    value={interest}
                    checked={checkedState[index].isChecked}
                    onChange={() => handleOnChange(index)
                  }/>
                  <label htmlFor={`interest-checkbox-${index}`}>{interest}</label>
                </div>
                
              )
            })
          }
          <input type="submit" value="Generate Result" />
        </form>
        <div className={styles.result}>
          <ul>
            {result.map(photo => (
              <li key={photo.id}>
                <PhotoComp photo={photo} />
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}