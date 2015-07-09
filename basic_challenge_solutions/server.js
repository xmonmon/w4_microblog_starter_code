// SERVER-SIDE JAVASCRIPT

// require express and other modules
var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    _ = require("underscore");

// serve js and css files from public folder
app.use(express.static(__dirname + '/public'));

// configure bodyParser (for handling data)
app.use(bodyParser.urlencoded({extended: true}));

//*****************************//
// Phrases

// pre-seeded phrase data
var phrases =[
  {id: 1, word: "REPL", definition: "Read, Eval, Print, Loop"},
  {id: 2, word: "Reference Type", definition: "Any data type that is not a primitive type"},
  {id: 3, word: "Constructor", definition: "Function used as a blueprint to create a new object with specified properties and methods"},
  {id: 4, word: "Callback", definition: "Function passed as an argument to another function"},
  {id: 5, word: "Query string", definition: "A list of parameters (represented as key-value pairs) appended to the end of a URL string"},
  {id: 6, word: "REST", defintion: "Representational State Transfer"},
  {id: 9, word: "JSON", definition: "JavaScript Object Notation"}
];
var totalPhraseCount = 9;


// ROUTES
// root route (serves index.html)
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/views/index.html');
});

// phrases index
app.get('/api/phrases', function (req, res) {
  // send all phrases as JSON response
  res.json(phrases);
});

// create new phrase
app.post('/api/phrases', function (req, res) {
  // grab params (word and definition) from form data
  var newPhrase = {}
  newPhrase.definition = req.body.definition;
  newPhrase.word = req.body.word;
  
  // set a unique id never used by a phrase until now
  totalPhraseCount++;
  newPhrase.id = totalPhraseCount;

  // add newPhrase to `phrases` array
  phrases.push(newPhrase);
  
  // send newPhrase as JSON response
  res.json(newPhrase);
});

// NEW!!
// get a single phrase 
app.get('/api/phrases/:id', function(req, res) {

  // set the value of the id
  var targetId = parseInt(req.params.id);

  // find item in `phrases` array matching the id
  var foundPhrase = _.findWhere(phrases, {id: targetId});

  // send back phrase object
  res.json(foundPhrase);
});

// update phrase
app.put('/api/phrases/:id', function(req, res) {

  // set the value of the id
  var targetId = parseInt(req.params.id);

  // find item in `phrases` array matching the id
  var foundPhrase = _.findWhere(phrases, {id: targetId});

  // update the phrase's word
  foundPhrase.word = req.body.word;

  // update the phrase's definition
  foundPhrase.definition = req.body.definition;

  // send back edited object
  res.json(foundPhrase);
});

// delete phrase
app.delete('/api/phrases/:id', function(req, res) {
  
  // set the value of the id
  var targetId = parseInt(req.params.id);

  // find item in `phrases` array matching the id
  var foundPhrase = _.findWhere(phrases, {id: targetId});

  // get the index of the found item
  var index = phrases.indexOf(foundPhrase);
  
  // remove the item at that index, only remove 1 item
  phrases.splice(index, 1);
  
  // send back deleted object
  res.json(foundPhrase);
});

//*****************************//
// Study Sets

// pre-seeded study set data
var studySets = [
  { id: 1, title: "Acronyms", phraseIds: [1,6], notes:[]},
  { id: 2, title: "Functions", phraseIds: [3,4], notes: [{id:1, author:"WDI19/20", text:"more like FUNctions!"}] }
];
var totalSetCount = 2;
var totalNoteCount = 1;

app.route('/api/study-sets')
  .get(function(req, res){ // get all study sets
    res.json(studySets);
  })
  .post(function(req,res){ // create a study set
    // grab set title and any included phrases from form data
    var newTitle = req.body.title;

    // need to parse out the phrase array because 
    // the body items come through as strings
    // (like how we have to parse the req.params.ids)
    var newPhraseIds = JSON.parse(req.body.phraseIds) || [];

    // for now, we won't allow the client to create new notes for a set
    // at the same time they make a study set
    var newNotes = []; 

    // set up new study-set object
    var newSet = { title: newTitle, phraseIds: newPhraseIds, notes: newNotes};

    // add a globally unique set id
    totalSetCount++;
    newSet.id = totalSetCount;

    // add new set to `studySets` array
    studySets.push(newSet);
    
    // send new set as JSON response
    res.json(newSet);
    
  });


app.route('/api/study-sets/:setId')
  .get(function(req, res) {  // get a single set
    // save the value of the id, and find the set
    var targetId = parseInt(req.params.setId);
    var foundSet = _.findWhere(studySets, {id: targetId});

    // send back the set
    res.json(foundSet);
  })
  .put(function(req,res){ // replace an old set with the new set data
    // set the value of the id
    var targetId = parseInt(req.params.setId);

    // find item in `studySets` array matching the id
    var foundSet = _.findWhere(studySets, {id: targetId});

    // update the set's title
    foundSet.title = req.body.title;

    // update the set's phrase id list
    foundSet.phraseIds = req.body.phraseIds;

    // send back edited object
    res.json(foundSet);
  })
  .delete(function(req, res){ // delete this whole study set
    // set the value of the id and find the study set with that id
    var targetId = parseInt(req.params.setId);
    var foundSet = _.findWhere(studySets, {id: targetId});

    // if we found the set, can delete it
    if (foundSet){
      // find the index of the set in our studySets data
      var setIndex = studySets.indexOf(targetId);
      // splice it out!
      studySets.splice(setIndex, 1);
      // respond that it's been deleted (you decide exactly how to respond!)
      res.status(200).send("deleted!");
    } else { // if we didn't find the set, let client know
      res.status(404).send("resource not found");
    }

  });

app.route('/api/study-sets/:setId/phrases')
  .get(function(req, res){  // get all phrases in this set
    // set the value of the  id
    var targetId = parseInt(req.params.setId);

    // find the study set with that id
    var foundSet = _.findWhere(studySets, {id: targetId});

    // send back the array of phrase ids from that study set
    res.json(foundSet.phraseIds);
  });

app.route('/api/study-sets/:setId/phrases/:phraseId')
  .put(function (req, res){ // add the phrase with specified id to this set
    // get the value of the set id, and find the study set with that id
    var setId = parseInt(req.params.setId);
    var foundSet = _.findWhere(studySets, {id: setId});

    // get the phrase id from url params, and find the phrase
    var phraseId = parseInt(req.params.phraseId);
    var foundPhrase = _.findWhere(phrases, {id: phraseId});

    if (foundSet && foundPhrase){     // both set and phrase exist! can add!
      if (foundSet.phraseIds.indexOf(phraseId) === -1){ // phrase is not yet in the set
        // add phrase id to this set's phrases
        foundSet.phraseIds.push(phraseId);
      }
      // let the client know about our success!
      res.json(foundSet);
    } else if (!foundSet){ 
      res.status(404).send("study set resource not found");
    } else { 
      res.status(404).send("phrase resource not found");
    }
  })
  .delete(function(req, res){  // remove this phrase from this set (NOT FROM PHRASES ARRAY)
    // get the value of the set id, and find the study set with that id
    var setId = parseInt(req.params.setId);
    var foundSet = _.findWhere(studySets, {id: setId});

    // get the phrase id, and find the phrase
    var phraseId = parseInt(req.params.phraseId);
    var foundPhrase = _.findWhere(phrases, {id: phraseId});

    // if we find the set and the phrase is in there:
    var phraseIndex = foundSet.phraseIds.indexOf(phraseId);
    if (foundSet && (phraseIndex !== -1)){
      // remove phrase id from this set's phrases
      foundSet.phraseIds.splice(phraseIndex, 1);

      // let the client know about our success!
      // Note: a few ways to "let client know"
      res.json(foundSet);  // can send back whole set
      // OR a status + message:
      // res.status(200).send("deleted!");

    } else { // otherwise send a failure response
      res.status(404).send("resource not found");
    }

  });

app.route('/api/study-sets/:setId/notes')
  .get(function(req, res){ // send all notes on this study-set
    // pull the set's id param from the url and find it
    var setId = parseInt(req.params.setId);
    var foundSet = _.findWhere(studySets, {id: setId});

    // if we found the set:
    if (foundSet){
      // send back the notes
      res.json(foundSet.notes);
    } else {  // otherwise:
      // send back a failure response
      res.status(404).send("resource not found");
    }
  })
  .post(function (req, res){ // add a note to this study-set
    // pull the set's id param from the url and find it
    var setId = parseInt(req.params.setId);
    var foundSet = _.findWhere(studySets, {id: setId});
    //if we find the set:
    if (foundSet){
      // set up the new note object
      var newNote = {};
      newNote.author = req.body.author;
      newNote.text = req.body.text;

      // don't forget the id!
      totalNoteCount++;
      newNote.id = totalNoteCount;

      // add the new note to the set's list
      foundSet.notes.push(newNote);

      // send the note as the response
      res.json(newNote)
    } else {    // otherwise send a failure response
      res.status(404).send("resource not found");
    }
  });



// set server to localhost:3000
app.listen(3000, function () {
  console.log('server started on localhost:3000');
});