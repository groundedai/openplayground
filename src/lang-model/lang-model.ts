// import cohere from "cohere-ai";
import { generateRequest } from "cohere-ai/dist/models";

export class LanguageModel {
  cohereApiKey: string;
  cohereConfig: generateRequest;

  constructor(cohereApiKey: string, cohereConfig: generateRequest) {
    // cohere.init(cohereApiKey);
    this.cohereApiKey = cohereApiKey;
    this.cohereConfig = cohereConfig;
  }

  async getSuggestions(prompt: string) {
    const response = fetch("https://api.cohere.ai/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.cohereApiKey}`,
      },
      body: JSON.stringify({
        prompt,
      }),
    });
    return response.then((res) => {
      const json = res.json();
      return json
    });
  }
}
