const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql');

const port = 3000;

/* ======================================================
Creating a database connection and connecting to database
====================================================== */
const database = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'phonebook',
    multipleStatements: true
});

database.connect((err) => {
    if (err) throw err;
    console.log('successfully connected to mysql database');
});
/* =================================================== */


const app = express();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, 'public')));


/* =======
/
======= */
app.get('/', (req, res) => {
    res.render('index', {});
});





/* =======
/phonebook
======= */
app.get('/phonebook', (req, res) => {
    let filtered = false;
    let errMsg = 'There are no records in the database.';

    // Create basic query without restriction
    let sqlQuery = `
        SELECT *
        FROM persons pe join phone_numbers pn on pe.person_id = pn.person_id
    `;

    // If filter has been specified by the user, modifiy basic query to add restriction
    if (Object.keys(req.query).length !== 0 && 'lNameFilter' in req.query && req.query.lNameFilter !== '') {
        lastNames = req.query.lNameFilter.split(';');
        let restriction = 'WHERE ';
        lastNames.forEach((v, i) => {
            restriction += `last_name = '${v}'`;
            if (i !== lastNames.length - 1)
                restriction += ' OR ';
        });
        sqlQuery += restriction;

        filtered = true;
        errMsg = 'There are no records with specified last name(s).';
    }

    // Query the database and render results to a view
    database.query(sqlQuery, (err, result) => {
        if (err) throw err;
        res.render('phone-book', {
            records: result,
            error: errMsg,
            inserted: req.query.insMsg
        });
    });
});


/* ==============
/phonebook-insert
============== */
app.post('/phonebook-insert', (req, res) => {
    let sqlQuery1 = `
        SELECT first_name,
               last_name
        FROM persons pe join phone_numbers pn on pe.person_id = pn.person_id
        WHERE phone_number = '${req.body.pNumber}'
    `;
    database.query(sqlQuery1, (err, result1) => {
        if (err) throw err;
        // Ako broj ne postoji u bazi
        if (result1.length === 0) {
            let sqlQuery2 = `
                SELECT person_id
                FROM persons
                WHERE first_name = '${req.body.fName}' AND
                      last_name = '${req.body.lName}'
            `;
            database.query(sqlQuery2, (err, result2) => {
                if (err) throw err;
                // Ako ne postoji osoba, uneti osobu zatim broj telefona za person_id unete osobe
                if (result2.length === 0) {
                    let sqlQuery3 = ` 
                        INSERT INTO persons(first_name, last_name)
                        VALUES('${req.body.fName}', '${req.body.lName}');
                        INSERT INTO phone_numbers(person_id, phone_number)
                        SELECT person_id, '${req.body.pNumber}'
                        FROM persons
                        WHERE first_name = '${req.body.fName}' AND
                              last_name = '${req.body.lName}'
                    `;
                    database.query(sqlQuery3, (err, result3) => {
                        if (err) throw err;
                        let message = `Inserted new person ${req.body.fName} ${req.body.lName} with a phone number ${req.body.pNumber.replace('+', '%2B')}`;
                        res.redirect('/phonebook?insMsg=' + message);
                    });
                // U suprotnom, uneti broj telefona za person_id postojece osobe
                } else {
                    let sqlQuery3 = `
                        INSERT INTO phone_numbers(person_id, phone_number)
                        VALUES (${result2[0].person_id}, '${req.body.pNumber}')
                    `;
                    database.query(sqlQuery3, (err, result3) => {
                        if (err) throw err;
                        let message = `Inserted new phone number ${req.body.pNumber.replace('+', '%2B')} for existing person ${req.body.fName} ${req.body.lName}`;
                        res.redirect('/phonebook?insMsg=' + message );
                    });
                }
            });
        // U suprotnom, ako broj postoji u bazi, preusmeriti i poslati poruku o postojanju broja
        } else {
            console.log('Entry already exists');
            console.log(result1);
            let message = `Phone number ${req.body.pNumber.replace('+', '%2B')} already exist in database for person ${result1[0].first_name} ${result1[0].last_name}`;
            res.redirect('/phonebook?insMsg=' + message);
        }
    });
});






app.listen(port, () => {
    console.log("Server running at port " + port);
});