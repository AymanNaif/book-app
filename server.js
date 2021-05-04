'use strict';

// application require setup
const express = require('express');
require('dotenv').config();
const server = express();
const PORT = process.env.PORT || 3000;
const superagent = require('superagent');
const cors = require('cors');
server.use(cors());
server.use(express.static('./public'));

// ejs setup
server.set('view engine', 'ejs');
server.use(express.urlencoded({ extended: true }));

// dataBase Setup
const pg = require('pg');

let client;
let DATABASE_URL = process.env.DATABASE_URL;
let ENV =  process.env.ENV||'';
if (ENV === 'DEV') {
  client = new pg.Client({
    connectionString: DATABASE_URL
  });
} else {
  client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: {}
  });
}
// Routes and functions
server.get('/', (req, res) => {
  res.render('./pages/index')
});

server.get('/search', (req, res) => {
  res.render('./pages/searches/show.ejs') // render show.ejs page
});
server.post('/search/new', booksHandelr) // read the data from the API and render the created objects inside new.ejs page


// server.post('/books', bookDetailsHandelr);

// end of route


//  books Data ................
function booksHandelr(req, res) {
  let search = req.body.search; // set the search value depend on form in show.ejs file fot text input name
  let term = req.body.radio // set the search value depend on form in show.ejs file fot radio input value
  // select the data if it's exists
  let booksUrl = `https://www.googleapis.com/books/v1/volumes?q=+${search}:${term}`;
  // let SQL = `SELECT * FROM books`;

  superagent.get(booksUrl)
    .then((bookData) => {
      let boData = bookData.body;
      let booksArr = [];
      boData.items.forEach((item) => {
        booksArr.push(new Books(item))
        // console.log(new Books(item).title)
        let SQL = `INSERT INTO books (img_url,title,authors,description) VALUES ($1,$2,$3,$4) RETURNING *`;
        let safeValue = [new Books(item).img_url, new Books(item).title, new Books(item).authors, new Books(item).description];

        client.query(SQL,safeValue).then(result => {
          console.log(result)
          res.send(result);
        })
        return booksArr;
      });


      // I have to Insert the data inside db
      // res.status(200).send(booksArr);
      res.render('./pages/searches/new.ejs',{booksData:booksArr}) // render new.js page and send data to it

    })
    .catch(error => {
      console.log(error);
      res.send(error);
    });
}

function Books(bookData) {
  this.title = bookData.volumeInfo.title || 'N/A';
  this.authors = bookData.volumeInfo.authors || 'N/A';
  this.description = bookData.volumeInfo.description || 'N/A';
  this.img_url = bookData.volumeInfo.imageLinks.smallThumbnail || bookData.volumeInfo.imageLinks.thumbnail || `https://i.imgur.com/J5LVHEL.jpg`;

}
client.connect()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`listening on port ${PORT}`);
    });

  });
// let SQL = INSERT INTO books (img_url,title,authors,description) VALUES ($1,$2,$3,$4)
// let SQL = SELECT * FROM books
// let safeValue = []
