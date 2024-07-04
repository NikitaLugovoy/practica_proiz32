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
    request: String,
    result: String,
    comment: String,
    like: Number,
    dislike: Number,
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

    let vote = await Vote.findOne({ login: login, password: password });

    if (!vote) {
        res.send('Неверные учетные данные');
    } else {
        res.render('index', { vote: vote });
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

app.post('/yandex-gpt', async (req, res) => {
    try {
        const response = await axios.post(yandexApiUrl, req.body, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Api-Key ${yandexApiKey}`
            }
        });
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