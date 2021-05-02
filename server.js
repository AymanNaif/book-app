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


server.get('/', (req, res) => {
  res.render('./pages/index')
});

server.get('/test', booksHandelr)

//  books Data ................
function booksHandelr(req, res) {
  let search = req.query.q;
  let booksUrl = `https://www.googleapis.com/books/v1/volumes?q=${search}`;
  superagent.get(booksUrl)
    .then((bookData) => {
      let boData = bookData.body;

      let booksArr = boData.items.map((item) =>new Books(item));

      res.status(200).send(booksArr);

    })
    .catch(error => {
      console.log(error);
      res.send(error);
    });
}

function Books(bookData) {
  this.title = bookData.volumeInfo.title;
  this.authors = bookData.volumeInfo.authors;
  this.description = bookData.volumeInfo.description;
  this.img_url = bookData.volumeInfo.imageLinks;

}
server.get('/show', (req, res) => {
  res.render('./pages/searches/show')
});



server.listen(PORT,() => {
  console.log(`listing to PORT ${PORT}`);
});

