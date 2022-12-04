export const tooltips : { [key: string]: string } = {
    "apiKey": "Your API is stored locally in your browser localStorage. It is not sent to any server.",
    "maxTokens": "The maximum number of tokens to generate.",
    "temperature": "The higher the temperature, the more creative the text will be. The lower the temperature, the more likely the text will be to make sense.",
    "topP": "The cumulative probability for top-p sampling: 0.0 means no restrictions. 1.0 means only 1 word is considered for each step (token), resulting in deterministic completions, while 0.5 means half of the words will be considered at each step. 0.9 means 90% of the words will be considered at each step.",
    "frequencyPenalty": "How much to penalize new tokens based on their existing frequency in the text so far. Decreases the model's likelihood to repeat the same line verbatim.",
    "presencePenalty": "How much to penalize new tokens based on whether they appear in the text so far. Increases the model's likelihood to talk about new topics.",
    "stop": "A list of sequences that will cause the model to stop generating text. The model will stop generating text after it reaches one of the stop sequences. The stop sequences can be specified as a list of strings, or a single string with each stop sequence separated by a newline character.",
};