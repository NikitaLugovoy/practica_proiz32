
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
        
    }

    async function chatGPTCompletion(query) {
        const apiKey = 'sk-proj-4c5ZGPgbQwRavQtmKmrAT3BlbkFJ1DcMgE2WEkEr9laUhnrO';
        const url = 'https://api.openai.com/v1/chat/completions';

        const headers = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        };

        const prompt = {
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'Ты ассистент программист.' },
                { role: 'user', content: query }
            ]
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(prompt)
            });
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            const data = await response.json();
            containersDiv.innerHTML = `
                <h2 class="content_header">ChatGPT Response:</h2>
                <pre>${JSON.stringify(data, null, 2)}</pre>
            `;
        } catch (error) {
            containersDiv.innerHTML = `<h2 class="content_header">Бесплатные попытки закончились, нужен новый ключ((( ${error.message}</h2>`;
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
            } else {
                containersDiv.innerHTML = `<h2 class="content_header">Выбранный поисковый движок не поддерживается.</h2>`;
            }
        }
    });
});
