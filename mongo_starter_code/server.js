// SERVER-SIDE JAVASCRIPT

// require express and other modules
var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    _ = require("underscore"),
    Post = require("./models/post.js");

// serve js and css files from public folder
app.use(express.static(__dirname + '/public'));

// configure bodyParser (for handling data)
app.use(bodyParser.urlencoded({extended: true}));


// Posts

function seedDB(){
  // pre-seeded post data - old
  var posts =[
    {id: 1, author: "Alan", text: "Hiked 8 miles this weekend! Finally made it out to the waterfall."},
    {id: 3, author: "Celeste", text: "On the other side of the cloud, a silver lining."},
    {id: 2, author: "Bette", text: "Garden starting to produce veggies! Best tomato ever."},
    {id: 4, author: "Daniel", text: "Been relearning geometry to help niece -- owning triangles so hard right now."},
    {id: 5, author: "Evelyn", text: "We need team jackets!"},
  ];


  // loop through the old post seed data, and create db records for each post
  // note that we DO NOT keep the id part  of the post --- Mongo will add an _id for us
  console.log("posts: ", posts);
  for (var i=0; i<posts.length; i++){
    console.log(i);
    // Post.create is the same as making a new Post instance and calling save on it
    Post.create({author: posts[i].author, text: posts[i].text}, function(err, newPost){
      console.log("creating post with author ", posts[i].author, " and text ", posts[i].text);
      if (err) {
        console.log(err);
      } else {
        console.log(newPost);
      }
    });
  }
}
seedDB();


// ROUTES

// Static file route(s)

// root route (serves index.html)
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/views/index.html');
});


// Data/API routes

// get all posts
app.get('/api/posts', function (req, res) {
  // find all posts from the database 
  var allPosts = Post.find({}, function(err, posts){
    if (err){
      console.log("error: ", err);
      res.status(500).send(err);
    } else {
      // send all posts as JSON response
      res.json(allPosts); 
    }
  });
});

// create new post
app.post('/api/posts', function (req, res) {
  // use params (author and text) from request body
  // to create a new post
  var newPost = Post.create({
        author: req.body.author,
        text: req.body.text
      }, 
      function(err, newPost){
        if (err) {
          console.log(err);
        } else {
          console.log(newPost);
        }
      });

  // send newPost as JSON response
  res.json(newPost);
});

// get a single post 
app.get('/api/posts/:id', function(req, res) {

  // take the value of the id from the url parameter
  var targetId = parseInt(req.params.id);

  // find item in database matching the id
  Post.findOne({_id: targetId}, function(err, foundPost){
    // send back post object
    res.json(foundPost);
  });

});

// update single post
app.put('/api/posts/:id', function(req, res) {

  // take the value of the id from the url parameter
  var targetId = parseInt(req.params.id);

  // find item in `posts` array matching the id
  Post.findOne({_id: targetId}, function(err, foundPost){
    console.log(foundPost); 

    if(err){
      res.status(500).send(err);

    } else {
      // update the post's author
      foundPost.author = req.body.author;

      // update the post's text
      foundPost.text = req.body.text;

      // save the changes
      foundPost.save(function(err){
        if (err){
          res.status(500).send(err);
        }
      });

      // send back edited object
      res.json(foundPost);
    }

  });

});

// delete post
app.delete('/api/posts/:id', function(req, res) {

  // take the value of the id from the url parameter
  var targetId = parseInt(req.params.id);

 // remove item from the db that matches the id
  Post.remove({_id: targetId}, function(err, foundPosts){
    if (err){
      res.status(500).send({ error: 'database error' });
    } else {
      // send back deleted object(s) -- will only be 1 because of unique ids
      res.json(foundPosts);
    }
  });
});

// set server to localhost:3000
app.listen(3000, function () {
  console.log('server started on localhost:3000');
});