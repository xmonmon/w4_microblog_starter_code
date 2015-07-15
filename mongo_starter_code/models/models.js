var mongoose = require('mongoose'),
	Schema = mongoose.Schema;


var CommentSchema = new Schema({
	body: {
		type: String,
		default: ""
	}
});

var Comment = mongoose.model('Comment', CommentSchema);


var AuthorSchema = new Schema({
	// author: {
		name: String,
		// default: ""
	// },

	// posts: [{
	// 	type: Schema.Types.ObjectId, // this is the referencing term
	// 	ref: 'Post' // and this is too
	// }]
});
var Author = mongoose.model('Author', AuthorSchema);

var PostSchema = new Schema({
	author: {
		 type: Schema.Types.ObjectId, // this is the referencing term
		 ref: 'Author' // and this is too
	},
		text: String,
		comments: [CommentSchema] // embedding the comments
});

var Post = mongoose.model('Post', PostSchema);


module.exports.Post = Post; // always remember the exports, it tells the server.js it how you're gonna get the schemas into the code.
module.exports.Comment = Comment; // always remember the exports, it tells the server.js it how you're gonna get the schemas into the code.
module.exports.Author = Author; // always remember the exports, it tells the server.js it how you're gonna get the schemas into the code.




