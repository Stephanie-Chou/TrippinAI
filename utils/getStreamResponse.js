import { createParser } from "eventsource-parser";

export  async function getStreamResponse(data) {
    let streamResponse = ""; // for the data to serve
    let streamResponseRender = ""; // for the rendering. this gets cut off
    const onParse = (event) => {
      if (event.type === "event") {
        const data = event.data;
        try {
          const text = JSON.parse(data).text ?? "";
          streamResponse+= text;
          streamResponseRender+= text;
          if (streamResponseRender.length > 300) {
            streamResponseRender="";
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    // https://web.dev/streams/#the-getreader-and-read-methods
    const reader = data.getReader();
    const decoder = new TextDecoder();
    const parser = createParser(onParse);
    let done = false;
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      parser.feed(chunkValue);
    }

    //setStream("");
    return streamResponse;
  }
