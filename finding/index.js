let express = require(`express`);
let app = express();
let port = 3005;

app.listen(port, function () {
    console.log(`http://localhost:${port}`);
})

// Раздача статики
app.use(express.static(`static`));

// Настройка handlebars
const hbs = require('hbs');
app.set('views', 'views');
app.set('view engine', 'hbs');

// Настройка POST-запроса
app.use(express.urlencoded({ extended: true }))

// Настройка БД
let mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/practica');

// Схемы
let votesSchema = new mongoose.Schema({
    nickname: String,
    login: String,
    password: String,
},{
    versionKey: false
});

let Vote = mongoose.model('users', votesSchema);

// Роуты API
app.get(`/`, async (req, res)=>{
    res.render(`login`)
})

app.post('/login', async (req, res) => {
    let login = req.body.login;
    let password = req.body.password;

    let vote = await Vote.findOne({ 
        login: login, 
        password: password 
    });

    if (!vote) {
        res.send('Неверные учетные данные');
    } else{
        res.redirect(`index`)
    }
});

app.get(`/register`, async (req, res)=>{
    res.render(`register`)
})

app.post(`/register`, async (req, res)=>{
    let nickname = req.body.nickname
    let login = req.body.login
    let password = req.body.password
    
    let vote = new Vote({
        nickname: nickname,
        login: login,
        password: password
    })
    await vote.save()
    res.redirect(`/`)
})
