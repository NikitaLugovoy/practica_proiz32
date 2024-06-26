document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.querySelector('.search_sign');
    const searchInput = document.querySelector('.search');
    const containersDiv = document.querySelector('.containers');
    const searchEngineSelect = document.querySelector('.search_engine');

    function decodeHtmlEntities(text) {
        return text.replace(/&#(\d+);/g, (match, dec) => {
            return String.fromCharCode(dec);
        }).replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&amp;/g, "&");
    }

    async function searchWikipedia(query) {
        const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(query)}&origin=*`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            const data = await response.json();
            const firstArticle = data.query.search[0];
            if (firstArticle) {
                const cleanedSnippet = decodeHtmlEntities(firstArticle.snippet.replace(/<[^>]+>/g, ''));
                containersDiv.innerHTML = `
                    <h2 class="content_header">Найденная статья: ${firstArticle.title}</h2>
                    <p class="result">${cleanedSnippet}</p>
                `;
            } else {
                containersDiv.innerHTML = `<h2 class="content_header">Статьи не найдены.</h2>`;
            }
        } catch (error) {
            containersDiv.innerHTML = `<h2 class="content_header">Ошибка при выполнении запроса: ${error.message}</h2>`;
        }
    }
    
    async function searchYandexGPT(query) {
        
        const url = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion";
        const apiKey = "AQVNxJ5bDf0YdFdVDl9ujKQQhi3T8tZqlN6MENI8";

        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Api-Key ${apiKey}`
        };

        const prompt = {
            modelUri: "gpt://b1gca4u7tp73kpmj87no/yandexgpt-lite",
            completionOptions: {
                stream: false,
                temperature: 0.6,
                maxTokens: "50"
            },
            messages: [
                { role: "system", text: "Ты ассистент программист." },
                { role: "user", text: query }
            ]
        };

        try {
            const response = await axios.post(url, prompt, { headers });
            const responseContent = response.data.response || 'Undefined';
            containersDiv.innerHTML = `
                <h2 class="content_header">Ответ от Yandex GPT :</h2>
                <pre>${responseContent}</pre>
            `;
        } catch (error) {
            containersDiv.innerHTML = `<h2 class="content_header">Ошибка при выполнении запроса: ${error.message}</h2>`;
        }
    }

    async function chatGPTCompletion(query) {
        const apiKey = 'sk-VfstGlrelAWTynLrNl6u1Hrd9kTxexIU';
        const baseUrl = 'https://api.proxyapi.ru/openai/v1';

        const data = {
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'user', content: query }
            ]
        };

        try {
            const response = await axios.post(`${baseUrl}/chat/completions`, data, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            const responseContent = response.data.choices[0].message.content || 'Undefined';
            containersDiv.innerHTML = `
                <h2 class="content_header">Ответ от ChatGPT :</h2>
                <pre>${responseContent}</pre>
            `;
        } catch (error) {
            containersDiv.innerHTML = `<h2 class="content_header">Ошибка при выполнении запроса: ${error.message}</h2>`;
        }
    }

    async function aimlAPI(query) {
        const { OpenAI } = require("openai");
        async function aimlAPI(query) {
            const openai = new OpenAI({
                apiKey: "e5aabe778d5c453a96f293c31900977f",
                baseURL: "https://api.aimlapi.com/",
            });
        
            try {
                const chatCompletion = await openai.chat.completions.create({
                    model: "mistralai/Mistral-7B-Instruct-v0.2",
                    messages: [
                        { role: "system", content: "You are a travel agent. Be descriptive and helpful" },
                        { role: "user", content: query }
                    ],
                    temperature: 0.7,
                    max_tokens: 128,
                });
                containersDiv.innerHTML = `
                    <h2 class="content_header">Ответ от OpenAI ChatGPT :</h2>
                    <pre>${chatCompletion.choices[0].message.content}</pre>
                `;
            } catch (error) {
                containersDiv.innerHTML = `<h2 class="content_header">Ошибка при выполнении запроса: ${error.message}</h2>`;
            }
        }
        
    }

    searchButton.addEventListener('click', async () => {
        const query = searchInput.value;
        const selectedEngine = searchEngineSelect.value;
    
        if (query.trim() !== "") {
            containersDiv.innerHTML = `<h2 class="content_header">Загрузка...</h2>`;
    
            if (selectedEngine === "wikipedia") {
                await searchWikipedia(query);
            } else if (selectedEngine === "yandex_gpt") {
                await searchYandexGPT(query);
            } else if (selectedEngine === "chat_gpt") {
                await chatGPTCompletion(query);
            } else if (selectedEngine === "aiml_api") {
                await aimlAPI(query); 
            } else {
                containersDiv.innerHTML = `<h2 class="content_header">Выбранный поисковый движок не поддерживается.</h2>`;
            }
        }
    });
    
});
