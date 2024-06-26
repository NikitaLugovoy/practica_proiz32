const axios = require('axios');
const { HttpProxyAgent } = require('http-proxy-agent');

const apiKey = 'sk-proj-4c5ZGPgbQwRavQtmKmrAT3BlbkFJ1DcMgE2WEkEr9laUhnrO'; 


const agent = new HttpProxyAgent(proxyUrl);

async function chatCompletion(messages) {
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo', 
            messages: messages
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            httpAgent: agent
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response) {
                console.error('Произошла ошибка запроса:', error.response.status, error.response.data);
            } else if (error.request) {
                console.error('Запрос был сделан, но не получен ответ:', error.request);
            } else {
                console.error('Ошибка настройки запроса:', error.message);
            }
        } else {
            console.error('Произошла неизвестная ошибка:', error.message);
        }

        console.log('Не хотите ли вы приобрести прокси для доступа к этому сервису?');
    }
}

const messages = [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello! How can you help me today?' }
];

chatCompletion(messages)
    .then(response => {
        if (response) {
            console.log(response);
        }
    })
    .catch(err => {
        console.error('Ошибка в функции chatCompletion:', err.message);
    });
