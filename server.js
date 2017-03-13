// Dependencies
var express = require("express");
var exphbs = require("express-handlebars");
var methodOverride = require("method-override");
var bodyParser = require("body-parser");

//mongoose related Dependencies
var logger = require("morgan");
var mongoose = require("mongoose");

// Requiring our comments and Article models
var Article = require("./models/article.js");
var Comments = require("./models/comments.js");

// scraping tools
var request = require("request");
var cheerio = require("cheerio");

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/cricinfo");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

var PORT = process.env.PORT || 3000;

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//root route
router.get("/", function (req, res) {
    res.render("index");
});

//A get Request to scrape the cricinfo website
app.get("/scrape", function (req, res) {
  //grabbing the body of the html
  request("www.cricinfo.com/", function (error, response, html) {

    //loading to cheerio
    var $ = cheerio.load(html);

    //grabbing all the articles wtih heading h2. most artilces were h2, that's why picking h2 here.
    $("articles h2").each(function(i, element) {
      //empty results array
      var resutls = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");

      //creating a new article entry
      var entry = new Article(result);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          console.log(doc);
        }
      });
    });
  });

  res.send("Scrape Complete");
});

// getting articles from db
app.get("/articles", function(req, res) {

  // getting all the docs from array
  Article.find({}, function(error, doc) {

    // Log any errors
    if (error) {
      console.log(error);
    }
    // sending articles to front end
    else {
      res.json(doc);
    }
  });
});

// Grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {

  // using id to find article in db
  Article.findOne({ "_id": req.params.id })

  // showing comments on that article
  .populate("comments")

  // now, execute our query
  .exec(function(error, doc) {

    // Log any errors
    if (error) {
      console.log(error);
    }

    // Otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

// Add a new comment
app.post("/articles/:id", function(req, res) {
  // Create a new comment and pass the req.body to the entry
  var newComment = new Comments(req.body);

  // And save the new comment
  newComment.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's comments
      Article.findOneAndUpdate({ "_id": req.params.id }, { "comments": doc._id })
      // Execute the above query
      .exec(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        else {
          // Or send the document to the browser
          res.send(doc);
        }
      });
    }
  });
});


// delete a new comment
app.post("/articles/:id", function(req, res) {
  Article.find({'_id': req.params.id}, 'comments', function(err,doc){
			if (err){
				console.log(err);
			}
			//deletes the comment from the coments Collection
				Comments.find({'_id' : doc[0].comments}).remove().exec(function(err,doc){
				  if (err){
						console.log(err);
					}

				});

		});

  //deletes the comments in the article document
		Article.findOneAndUpdate({'_id': req.params.id}, {$unset : {'comment':1}})
		.exec(function(err, doc){
			if (err){
				console.log(err);
			}
      else {
				res.send(doc);
			}
		});
});

app.listen(PORT, function() {
    console.log("Listening to " + PORT);
});
