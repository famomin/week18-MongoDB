// Require mongoose
var mongoose = require("mongoose");
// Create a schema class
var Schema = mongoose.Schema;

// Create the comments schema
var CommentSchema = new Schema({
  //name
  fullName: String,

  //Comment body
  body: {
    type: String
  },

  // Date
  createdAt: {
    type: Date,
    default: Date.now
  },
});

// Create the Comment model with the CommentSchema
var Comments = mongoose.model("Comments", CommentSchema);

// Export the Comment model
module.exports = Comments;
