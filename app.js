const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql');

const port = process.env.PORT || 8080;

/*
    ===================================================
    Creating a database connection and connecting to it
    ===================================================
*/
const database = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'phonebook',
    multipleStatements: true // This option is for being able to run multistatement queries.
    // Took some research to figure it out.
});

database.connect((err) => {
    if (err) throw err;
    console.log('successfully connected to mysql database');
});



/*
    ==========================
    Create express application
    ==========================
*/
const app = express();



/*
    ==========================================
    Set view engine and path to template files
    ==========================================
*/
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



/*
    ========================
    Set essential middleware
    ========================
*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));



/*
    ========================
    Set path to static files
    ========================
*/
app.use(express.static(path.join(__dirname, 'public')));



/*
    =
    /
    =
*/
/*app.get('/', (req, res) => {
    res.render('index', {});
});*/


app.get('/test', (req, res) => {
    res.send('<p>Muzika mi svira na uvce<br>a decu zabole uvce</p>');
});



/* 
    ==========
    /phonebook
    ==========
*/
app.get('/phonebook', (req, res) => {
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
            if (/^\w*\.{3}$/.test(v))
                restriction += `last_name LIKE '${v.replace('...', '')}%'`;
            else if (/^\.{3}\w*$/.test(v))
                restriction += `last_name LIKE '%${v.replace('...', '')}'`;
            else
                restriction += `last_name = '${v}'`;
            if (i !== lastNames.length - 1)
                restriction += ' OR ';
        });

        sqlQuery += restriction;
        errMsg = 'There are no records with specified last name(s).';
    }

    // Query the database and render results to a view
    database.query(sqlQuery, (err, result) => {
        if (err) throw err;
        res.render('phone-book', {
            records: result,
            error: errMsg,
            databaseMod: req.query.databaseMod
        });
    });
});



/* 
    =================
    /phonebook-insert
    =================
*/
app.post('/phonebook-insert', (req, res) => {
    let sqlQuery1 = `
        SELECT first_name,
               last_name
        FROM persons pe join phone_numbers pn on pe.person_id = pn.person_id
        WHERE phone_number = '${req.body.pNumber}'
    `;
    database.query(sqlQuery1, (err, result1) => {
        if (err) throw err;
        // If the phone number does not exist in the database
        if (result1.length === 0) {
            let sqlQuery2 = `
                SELECT person_id
                FROM persons
                WHERE first_name = '${req.body.fName}' AND
                      last_name = '${req.body.lName}'
            `;
            database.query(sqlQuery2, (err, result2) => {
                if (err) throw err;
                // If the person does not exist in the database, first insert person, then insert phone number
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
                        res.redirect('/phonebook?databaseMod=' + message);
                    });
                // Otherwise, insert the phone number for the existing person
                } else {
                    let sqlQuery3 = `
                        INSERT INTO phone_numbers(person_id, phone_number)
                        VALUES (${result2[0].person_id}, '${req.body.pNumber}')
                    `;
                    database.query(sqlQuery3, (err, result3) => {
                        if (err) throw err;
                        let message = `Inserted new phone number ${req.body.pNumber.replace('+', '%2B')} for existing person ${req.body.fName} ${req.body.lName}`;
                        res.redirect('/phonebook?databaseMod=' + message );
                    });
                }
            });
        // Otherwise, if the phone number does exist in the database, redirect and send appropriate message
        } else {
            console.log('Entry already exists');
            console.log(result1);
            let message = `Phone number ${req.body.pNumber.replace('+', '%2B')} already exist in database for person ${result1[0].first_name} ${result1[0].last_name}`;
            res.redirect('/phonebook?databaseMod=' + message);
        }
    });
});



/* 
    =================
    /phonebook-delete
    =================
*/
app.post('/phonebook-delete', (req, res) => {
    let message = '';
    console.log("delMarked: " + req.body.delMarked);
    if  (req.body.delMarked === undefined) {
        console.log("TRIGEROVANO!");
        res.redirect('/phonebook?databaseMod=No records selected for deletion'); return }

    if (!(req.body.delMarked instanceof Array)) {
        let tmpArray = [];
        tmpArray.push(req.body.delMarked);
        req.body.delMarked = tmpArray;
    }
    console.log(req.body.delMarked);
    req.body.delMarked.forEach((v, i) => {
        let sqlQuery1 = `
            SELECT pn.person_id, first_name, last_name
            FROM phone_numbers pn join persons pe on pn.person_id = pe.person_id
            WHERE phone_number = '${v}'
        `;
        database.query(sqlQuery1, (err, result1) => {
            if (err) throw err;
            let sqlQuery2 = `
                DELETE FROM phone_numbers
                WHERE phone_number = '${v}'
            `;
            database.query(sqlQuery2, (err, result2) => {
                if (err) throw err;
                let sqlQuery3 = `
                    SELECT *
                    FROM phone_numbers
                    WHERE person_id = ${result1[0].person_id}
                `;
                database.query(sqlQuery3, (err, result3) => {
                    if (err) throw err;
                    if (result3.length === 0) {
                        let sqlQuery4 = `
                            DELETE FROM persons
                            WHERE person_id = ${result1[0].person_id}
                        `;
                        database.query(sqlQuery4, (err, result4) => {
                            if (err) throw err;
                            if (i !== 0)
                                message += '%3Cbr%3E';
                            message += `Deleted phone number ${v.replace('+', '%2B')} AND person ${result1[0].first_name} ${result1[0].last_name}`;
                            if (i === req.body.delMarked.length - 1)
                                res.redirect('/phonebook?databaseMod=' + message);
                        });
                    } else {
                        if (i !== 0)
                            message += '%3Cbr%3E';
                        message += `Deleted phone number ${v.replace('+', '%2B')} of person ${result1[0].first_name} ${result1[0].last_name}`;
                        if (i === req.body.delMarked.length - 1)
                            res.redirect('/phonebook?databaseMod=' + message);
                    }

                });
            });
        });

    });
    console.log(message);
});



/*
    ===================
    Initiating listener
    ===================
*/
app.listen(port, () => {
    console.log("Server running at port " + port);
});
