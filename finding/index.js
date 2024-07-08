let express = require('express');
let axios = require('axios');
const cors = require('cors');
let app = express();
let port = 3005;

app.listen(port, function () {
    console.log(`http://localhost:${port}`);
});

app.use(express.json());
axios.defaults.headers.post['Content-Type'] = 'application/json';

app.use(express.static('static'));
app.use(cors({
    origin: 'http://localhost:3005', // Укажите домен, с которого разрешены запросы
    methods: ['GET', 'POST'], // Разрешенные методы
    allowedHeaders: ['Content-Type', 'Authorization'] // Разрешенные заголовки
}));

const hbs = require('hbs');
app.set('views', 'views');
app.set('view engine', 'hbs');

app.use(express.urlencoded({ extended: true }));

let mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/practica');

let votesSchema = new mongoose.Schema({
    nickname: String,
    login: String,
    password: String,
    User_ID:String,
    request: String,
    result: String,
    source: String
}, {
    versionKey: false
});

let Vote = mongoose.model('users', votesSchema);

app.get('/', async (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    let login = req.body.login;
    let password = req.body.password;
    try {
        let vote = await Vote.findOne({ login: login, password: password });

        if (!vote) {
            res.send('Неверные учетные данные');
        } else {
            res.render('index', { vote: vote });
        }
    } catch (error) {
        console.error('Ошибка при выполнении запроса к базе данных:', error);
        res.status(500).send('Произошла ошибка при выполнении запроса к базе данных');
    }
});


app.get('/register', async (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    let nickname = req.body.nickname;
    let login = req.body.login;
    let password = req.body.password;

    let vote = new Vote({
        nickname: nickname,
        login: login,
        password: password
    });
    await vote.save();
    res.redirect('/');
});

app.get('/index', async (req, res) => {
    res.render('index');
});

app.get('/history', async (req, res) => {
    let id = req.query.id;
    let data = await Vote.find({
        _id : id
    });
    res.render('history', {practica: data});
});

const yandexApiUrl = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion";
const yandexApiKey = "AQVNxJ5bDf0YdFdVDl9ujKQQhi3T8tZqlN6MENI8";

async function saveRequestToDatabase(request, result, source, User_ID) {
    try {
        let vote = new Vote({
            request: request,
            result: JSON.stringify(result),  // Преобразование объекта ответа в строку JSON
            source: source,
            User_ID: User_ID // Добавление User_ID в объект
        });
        await vote.save();
        console.log('Запись успешно сохранена в базе данных.');
    } catch (error) {
        console.error('Ошибка при сохранении записи в базу данных:', error);
        throw error;  // Можно выбросить ошибку для обработки в обработчиках маршрутов
    }
}

app.post('/wikipedia', async (req, res) => {
    const query = req.body.query;
    const User_ID = req.body.User_ID; // Получение User_ID из запроса

    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(query)}&origin=*&utf8=&srlimit=1`;

    try {
        const response = await axios.get(apiUrl);
        const data = response.data;
        const firstArticle = data.query.search[0];

        if (firstArticle) {
            const pageId = firstArticle.pageid;
            const pageUrl = `https://en.wikipedia.org/?curid=${pageId}`;
            const apiTextUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exsentences=2&explaintext=true&pageids=${pageId}&origin=*`;

            const responseText = await axios.get(apiTextUrl);
            const textData = responseText.data;
            const textExtract = textData.query.pages[pageId].extract;

            // Сохранение данных в базу данных с User_ID
            await saveRequestToDatabase(query, { ...data, textExtract }, 'Wikipedia', User_ID);

            res.json({
                title: firstArticle.title,
                textExtract: textExtract,
                pageUrl: pageUrl
            });
        } else {
            res.status(404).send('Статьи не найдены.');
        }
    } catch (error) {
        console.error('Error fetching Wikipedia data:', error);
        res.status(500).send('Ошибка при выполнении запроса к Википедии');
    }
});


app.post('/yandex-gpt', async (req, res) => {
    try {
        const User_ID = req.body.User_ID; // Получение User_ID из запроса

        const response = await axios.post(yandexApiUrl, req.body, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Api-Key ${yandexApiKey}`
            }
        });

        // Сохранение данных в базу данных с User_ID
        await saveRequestToDatabase(req.body.messages[1].text, response.data, 'Yandex GPT', User_ID);

        console.log("Response from Yandex API:", response.data);
        res.json(response.data);
        
    } catch (error) {
        console.error('Error making request to Yandex GPT:', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        }
        res.status(500).send('Ошибка при выполнении запроса к Yandex GPT');
    }
});


app.post('/your/server/route', (req, res) => {
    const userId = req.body.User_ID;
    console.log('Received userId:', userId);
    // Дальнейшая обработка переменной userId
    req.userId = userId;

});


const aimlApiUrl = "https://api.aimlapi.com/chat/completions";
const aimlApiKey = "e9ba996088ed486fb21e4b7bcf335063";
app.post('/aiml-api', async (req, res) => {
    try {
        const userId = req.body.User_ID; // Получение User_ID из запроса
        const response = await axios.post(aimlApiUrl, req.body, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${aimlApiKey}`
            }
        });

        // Сохранение данных в базу данных
        await saveRequestToDatabase(req.body.messages[1].content, response.data, 'AIML API', userId);

        console.log("Response from AIML API:", response.data);
        res.json(response.data);

    } catch (error) {
        console.error('Error making request to AIML API:', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        }
        res.status(500).send('Ошибка при выполнении запроса к AIML API');
    }
});


const chatGptUrl = "https://api.proxyapi.ru/openai/v1/chat/completions";
const chatGptApiKey = "sk-VfstGlrelAWTynLrNl6u1Hrd9kTxexIU";

app.post('/chatgpt', async (req, res) => {
    try {
        const userId = req.headers['x-user-id']; // Получение User_ID из заголовка
        const response = await axios.post(chatGptUrl, req.body, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${chatGptApiKey}`
            }
        });

        // Сохранение данных в базу данных
        await saveRequestToDatabase(req.body.messages[0].content, response.data, 'ChatGPT', userId);

        console.log("Response from ChatGPT:", response.data);
        res.json(response.data);
        
    } catch (error) {
        console.error('Error making request to ChatGPT:', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        }
        res.status(500).send('Ошибка при выполнении запроса к ChatGPT');
    }
});

