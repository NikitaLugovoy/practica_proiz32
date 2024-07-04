const fetch = require('node-fetch'); 
const searchQuery = 'Artificial intelligence';

const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(searchQuery)}`;

function decodeHtmlEntities(text) {
  return text.replace(/&#(\d+);/g, (match, dec) => {
    return String.fromCharCode(dec);
  }).replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

fetch(apiUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    const firstArticle = data.query.search[0];
    if (firstArticle) {
      const cleanedSnippet = decodeHtmlEntities(firstArticle.snippet.replace(/<[^>]+>/g, ''));
      console.log('Первая найденная статья:', firstArticle.title);
      console.log('Очищенный текст выдержки:', cleanedSnippet);
    } else {
      console.log('Статьи не найдены.');
    }
  })
  .catch(error => {
    console.error('Ошибка при выполнении запроса:', error);
  });
