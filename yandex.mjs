import fetch from 'node-fetch';

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

fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(prompt)
})
.then(response => response.json())
.then(result => {
    console.log(JSON.stringify(result, null, 2));
})
.catch(error => console.error('Error:', error));
