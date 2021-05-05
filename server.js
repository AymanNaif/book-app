'use strict';

// application require setup
const express = require('express');
require('dotenv').config();
const server = express();
const PORT = process.env.PORT || 3000;
const superagent = require('superagent');
const cors = require('cors');
const methodOverride = require('method-override');
server.use(cors());
server.use(express.static('./public'));

server.use(methodOverride('_method'));
// ejs setup
server.set('view engine', 'ejs');
server.use(express.urlencoded({ extended: true }));

// dataBase Setup
const pg = require('pg');

let client;
let DATABASE_URL = process.env.DATABASE_URL;
// let ENV =  process.env.ENV||'';
// if (ENV === 'DEV') {
//   client = new pg.Client({
//     connectionString: DATABASE_URL
//   });
// } else {
//   client = new pg.Client({
//     connectionString: DATABASE_URL,
//     ssl: {}
//   });
// }


// Database Heroku operation
client = new pg.Client({
  connectionString: DATABASE_URL,
});

// Routes and functions
server.get('/', addBookHome);

server.get('/search', (req, res) => {
  res.render('./pages/searches/show.ejs') // render show.ejs page
});
server.post('/search/new', booksHandelr) // read the data from the API and render the created objects inside new.ejs page
server.post('/books', bookSelectHandelr); // Insert the data inside database
server.get('/books/:id', bookDetailsHandelr); // select data from database and add it to details page
server.put('/updateBook/:id', updateBook); // recive delete (delete) req, then delete from database
server.delete('/deleteBook/:id', deleteBook); // recive update (put) req, then make the update on database

// end of route


//  books Data ................
//  read API and render the data from it
function booksHandelr(req, res) {
  let search = req.body.search; // set the search value depend on form in pages/show.ejs file for text input name
  let term = req.body.radio // set the search value depend on form in pages/show.ejs file for radio input value
  let booksUrl = `https://www.googleapis.com/books/v1/volumes?q=+${search}:${term}`;

  superagent.get(booksUrl)
    .then((bookData) => {
      let boData = bookData.body;
      let booksArr = [];
      boData.items.forEach((item) => {
        booksArr.push(new Books(item))
        return booksArr;
      });

      res.render('./pages/searches/new.ejs',{booksData:booksArr}) // render new.js page and send data to it

    })
    .catch(error => {
      res.render('./pages/error',{wrong:error});
    });
}

function Books(bookData) {
  this.title = bookData.volumeInfo.title || `there's no title for this book`;
  this.authors = bookData.volumeInfo.authors || `the authors name not available for this book`;
  this.description = bookData.volumeInfo.description || `there's no description for this book`;
  this.img_url = bookData.volumeInfo.imageLinks.smallThumbnail || bookData.volumeInfo.imageLinks.thumbnail || `https://i.imgur.com/J5LVHEL.jpg`;
  this.isbn=bookData.volumeInfo.industryIdentifiers[0].identifier || 'ISBN NOT Valid'

}

// make database server to start then the express server --- (pgstart then nodemon)
client.connect()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`listening on port ${PORT}`);
    });

  });


//  Insert the data inside database
function bookSelectHandelr(req, res) {
  let SQL = `INSERT INTO books (img_url,title,authors,description,isbn) VALUES ($1,$2,$3,$4,$5) RETURNING *`;
  let safeValue = [req.body.img_url, req.body.title, req.body.authors, req.body.description, req.body.isbn];
  client.query(SQL, safeValue).then(result => {
    res.redirect(`/books/${result.rows[0].id}`);
  }) .catch(error => {
    res.render('./pages/error',{wrong:error});
  });
}

// select data from database and add it to home page
function addBookHome(req, res) {
  let SQL = 'SELECT * FROM books;';
  client.query(SQL).then(result => {
    res.render('pages/index.ejs',{dataBaseData:result.rows});
  }) .catch(error => {
    res.render('./pages/error',{wrong:error});
  });
}

// select data from database and add it to details page
function bookDetailsHandelr(req, res) {
  let SQL = 'SELECT * FROM books WHERE id=$1;';
  let safeValue = [req.params.id];
  client.query(SQL,safeValue).then(result => {
    res.render('pages/books/show',{dataBaseData:result.rows});
  }) .catch(error => {
    res.render('./pages/error', {wrong: error});
  });
}

//  recive update (put) req, then make the update on database
function updateBook(req,res) {
  let SQL = `UPDATE books SET img_url=$1,title=$2,authors=$3,description=$4,isbn=$5 WHERE id=$6;`;
  let safeValue = [req.body.img_url, req.body.title, req.body.authors, req.body.description, req.body.isbn, req.params.id];
  client.query(SQL, safeValue).then(() => {
    res.redirect(`/books/${req.params.id}`);
  })
}

//  recive delete (delete) req, then delete from database
function deleteBook(req, res) {
  let SQL = `DELETE FROM books WHERE id=$1;`;
  let safeValue = [req.params.id];
  client.query(SQL, safeValue).then(() => {
    res.redirect(`/`)
  });
}


// Database Heroku operation
// client = new pg.Client({
//   connectionString: DATABASE_URL,
// });
