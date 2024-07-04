const axios = require('axios');

const apiKey = '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';

const proxyUrl = 'https://api.proxyapi.ru/openai/v1';

async function chatCompletion(messages) {
    const proxyAgent = axios.create({
        proxy: {
            host: proxyUrl,
            port: 443, 
        }
    });

    try {
        const response = await proxyAgent.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4',
            messages: messages
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            }
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
