const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const port = 3000;
const app = express();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
    res.render('index', {
        title: 'Customers reports'
    });
});


app.listen(port, () => {
    console.log("Server started at port " + port);
});