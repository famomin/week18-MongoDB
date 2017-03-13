// requiring mongoose
var mongoose = require("mongoose");

//creating schema class
var Schema = mongoose.Schema;

//creating article schema
var CommentSchema = new Schema({
  //article title
  title: {
    type: String,
    required: true
  },

  //link for the article
  link: {
    type: String,
    required: true
  },

  //array for comments from users.
  comments: [Comment]
})
