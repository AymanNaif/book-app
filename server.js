'use strict';

const express = require('express');
require('dotenv').config();
const server = express();
const PORT = process.env.PORT || 3000;
const superagent = require('superagent');
const cors = require('cors');
server.use(cors());

server.set('view engine','ejs');
server.use(express.static('./public'));

server.use(express.urlencoded({ extended: true }));

server.get('/', (req, res) => {
  res.render('./pages/index')
});

server.get('/search', (req, res) => {
  res.render('./pages/searches/show.ejs')
});
server.post('/search/new', booksHandelr)

//  books Data ................
function booksHandelr(req, res) {
  let search = req.body.search;
  let term = req.body.radio

  let booksUrl = `https://www.googleapis.com/books/v1/volumes?q=+${search}:${term}`;
  superagent.get(booksUrl)
    .then((bookData) => {
      let boData = bookData.body;

      let booksArr = boData.items.map((item) =>new Books(item));

      // res.status(200).send(booksArr);
      res.render('./pages/searches/new.ejs',{booksData:booksArr})

    })
    .catch(error => {
      console.log(error);
      res.send(error);
    });
}

function Books(bookData) {
  this.title = bookData.volumeInfo.title|| 'N/A';
  this.authors = bookData.volumeInfo.authors|| 'N/A';
  this.description = bookData.volumeInfo.description || 'N/A';
  this.img_url = bookData.volumeInfo.imageLinks.smallThumbnail || bookData.volumeInfo.imageLinks.thumbnail || `https://i.imgur.com/J5LVHEL.jpg`;

}

server.listen(PORT,() => {
  console.log(`listing to PORT ${PORT}`);
});

