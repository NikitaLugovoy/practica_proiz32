const axios = require('axios');

const prompt = {
    modelUri: "gpt://b1gca4u7tp73kpmj87no/yandexgpt-lite",
    completionOptions: {
        stream: false,
        temperature: 0.6,
        maxTokens: "200"
    },
    messages: [
        {
            role: "system",
            text: "Ты ассистент программист."
        },
        {
            role: "user",
            text: "Привет, ассистент! Расскажи о C++"
        }
    ]
};

const url = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion";
const apiKey = "AQVNxJ5bDf0YdFdVDl9ujKQQhi3T8tZqlN6MENI8";

const headers = {
    "Content-Type": "application/json",
    "Authorization": `Api-Key ${apiKey}`
};

axios.post(url, prompt, { headers })
    .then(response => {
        console.log(JSON.stringify(response.data, null, 2));
    })
    .catch(error => {
        console.error('Error:', error);
    });
