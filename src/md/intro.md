## What is OpenPlayground?

OpenPlayground is a web application that allows you to experiment with large language models, compare different language models from different providers, and run them on your data. The goal is to make it easier for people to start benefiting from language models in their work.

## Why use OpenPlayground?

Let's say you need to carry out a repetitive task such as annotating, summarising, or extracting information from text. Large language models can be used to perform these tasks, allowing us to get a huge amount more done.

However, it is still difficult to benefit from these models because of the time and expertise they require to setup and run.

OpenPlayground helps by making it easy to try out different language models from different providers and find what works best for you. It then helps you go to the next step and run the model on large amounts of data.

## How does it work?

OpenPlayground has a few different parts:

- **[Playground](#/playground)** - The first part is a playground where you can try out different language models and settings. This includes a library of examples that you can use to get started.<br/><br/>
- **[Datasets](#/datasets)** - The second part is the ability to upload your own data. This can be used in the playground as you experiment with different models and settings, and later to run models on an entire dataset.<br/><br/>
- **[Runs](#/runs)** - The third part is the ability to run a model across a whole dataset. You can use the playground to find the best model and settings for your task, save them as a preset, then run them on your data. You can then download the results and use them in your own processes.

## How to use

### Using language model providers

Language model providers are the services that provide the language models. Currently, OpenPlayground supports the following providers:

- [Cohere](https://cohere.ai/)
- [OpenAI](https://openai.com/)
- [HuggingFace](https://huggingface.co/)

To use a provider, you need to create an account with them and get an API key. You will need to enter this API key in the [playground](#/playground) in order to use the provider.

### Training a language model

To get the model to generate your desired result, you will usually need to give it at least a few examples of the desired result. For example, if you want to summarise text, you will need to give it a few examples that the type of summary you want. These examples form the prompt that is given to the model.

You can use the model itself to help you generate these examples. For example, if you want to summarise text, you can use the model to generate a summary and then edit it to make it better.

In addition to finding the right prompt, you will also need to find the right model and settings. Different models and settings have different strengths and weaknesses. For example, some models are better at summarising text, while others are better at generating creative text. You can use the playground to try out different models and settings and find what works best for you.

### Running a model on your data

Once you have found the best model and settings for your task, you can run the model on your data and download the results. You can do this in the [Run](#/run) page.

## How to contribute

OpenPlayground is open source and we welcome contributions. You can find the code on GitHub (todo: link).

If you would like to donate to support the development of OpenPlayground, you can do so here (todo: link).

## Contact

Please contact us with any questions, feedback or ideas for working together.
