
    const searchButton = document.querySelector('.search_sign');
    const searchInput = document.querySelector('.search');
    const containersDiv = document.querySelector('.containers');
    const searchEngineSelect = document.querySelector('.search_engine');
    const contDiv = document.querySelector('.cont');

    

    async function searchWikipedia(query) {
        const User_ID = document.getElementById('userId').value; // Assuming 'userId' is the ID of your input field for User_ID
    
        const apiUrl = `http://localhost:3005/wikipedia`; // Update to match your backend route
    
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query, User_ID })
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
    
            const data = await response.json();
            // Process response as needed
            if (data.title) {
                const pageUrl = data.pageUrl;
                containersDiv.innerHTML = `
                    <h2 class="content_header">Найденная статья: ${data.title}</h2>
                    <p class="result">${data.textExtract}</p>
                    <a href="${pageUrl}" target="_blank" class="read_more">Читать больше на Wikipedia</a>
                `;
            } else {
                containersDiv.innerHTML = `<h2 class="content_header">Статьи не найдены.</h2>`;
            }
        } catch (error) {
            console.error('Error searching Wikipedia:', error);
            containersDiv.innerHTML = `<h2 class="content_header">Ошибка при выполнении запроса: ${error.message}</h2>`;
        }
    }
    

    async function searchYandexGPT(query) {
    const User_ID = document.getElementById('userId').value; // Получение User_ID из скрытого поля

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
                text: "Ты ассистент профессор."
            },
            {
                role: "user",
                text: query
            }
        ],
        User_ID: User_ID // Включение User_ID в тело запроса
    };

    try {
        const response = await axios.post('http://localhost:3005/yandex-gpt', prompt, {
            headers: {
                "Content-Type": "application/json"
            }
        });
        const responseData = response.data;
        console.log("Получен ответ от Yandex API:", responseData);

        const responseContent = responseData.result.alternatives[0]?.message.text || 'Не удалось получить ответ от Yandex GPT';
        containersDiv.innerHTML = `
            <h2 class="content_header">Ответ от Yandex GPT :</h2>
            <pre>${responseContent}</pre>
        `;
    } catch (error) {
        console.error('Error:', error);
        containersDiv.innerHTML = `<h2 class="content_header">Ошибка при выполнении запроса: ${error.message}</h2>`;
    }
}

    
    
    
    
async function chatGPTCompletion(query) {
    const apiKey = 'sk-VfstGlrelAWTynLrNl6u1Hrd9kTxexIU';
    const baseUrl = 'https://api.proxyapi.ru/openai/v1';
    const User_ID = document.getElementById('userId').value; 

    const data = {
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'user', content: query }
        ]
    };

    try {
        const response = await axios.post('/chatgpt', data, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'X-User-ID': User_ID // Custom header to pass User_ID
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
        const apiKey = "e9ba996088ed486fb21e4b7bcf335063"; 
        const baseUrl = "https://api.aimlapi.com";
        const User_ID = document.getElementById('userId').value; 
    
        const data = {
            model: "mistralai/Mistral-7B-Instruct-v0.2",
            messages: [
                { role: "system", content: "Вы умный профессор. Будьте описательны и полезны" },
                { role: "user", content: query }
            ],
            temperature: 0.7,
            max_tokens: 128,
            User_ID: User_ID 
        };
    
        try {
            const response = await axios.post('/aiml-api', data, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            const responseContent = response.data.choices[0].message.content || 'Undefined';
            containersDiv.innerHTML = `
                <h2 class="content_header">Ответ от AIML API :</h2>
                <pre>${responseContent}</pre>
            `;
        } catch (error) {
            containersDiv.innerHTML = `<h2 class="content_header">Ошибка при выполнении запроса: ${error.message}</h2>`;
        }
    }
    
    
    function initializeSearch() {
        searchButton.addEventListener('click', async () => {
            const query = searchInput.value;
            const selectedEngine = searchEngineSelect.value;
            contDiv.style.display = 'block';
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
    }

    initializeSearch();
