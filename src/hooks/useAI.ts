import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from "zod";

import { context } from "../model/ai";

const schema = z.object({
  response: z.string(),
  code: z.string(),
  error: z.boolean(),
});

export async function callOpenAI(
  messages: { role: string; content: string }[]
) {
  const apiKey = localStorage.getItem("apiKey");
  if (!apiKey) {
    throw new Error("API key is not set");
  }

  const responseFormat = zodResponseFormat(schema, 'correct')

  let retries = 3;
  let response;
  do {
    response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o", // o 'gpt-3.5-turbo'
        messages: [{ role: "system", content: context }, ...messages],
        stream: false, // si no quieres streaming (puede ponerse true si sabes manejar streams)
        response_format: responseFormat,
      }),
    });

    const data = await response.json();

    if (response.status !== 200) {
      retries--;
      console.error("Error:", data);
      continue;
    }

    console.log(data.choices?.[0]?.message?.content);

    let validJSON;
    try {
      validJSON = JSON.parse(data.choices?.[0]?.message?.content);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      retries--;
      continue;
    }

    const parsedData = await schema.safeParseAsync(validJSON);

    if (!parsedData.success) {
      retries--;
      console.error("Error:", parsedData.error);
      continue;
    }

    return parsedData.data;
  } while (retries >= 0);
}
