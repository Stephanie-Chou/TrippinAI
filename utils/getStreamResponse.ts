import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";
import { Dispatch, SetStateAction } from "react";

export async function getStreamResponse(data: ReadableStream, setStateCallback?: Dispatch<SetStateAction<string>>): Promise<string> {
  let streamResponse: string = ""; // for the data to serve
  const onParse = (event: ParsedEvent | ReconnectInterval) => {
    if (event.type === "event") {
      const data = event.data;
      try {
        const text = JSON.parse(data).text ?? "";
        streamResponse += text;
        if (setStateCallback) {
          setStateCallback(streamResponse);
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

  return streamResponse;
}
