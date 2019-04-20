const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

commentSchema = new Schema(
	{
		rating: {
			type: Number,
			min: 1,
			max: 5,
			required: true
		},
		comment: {
			type: String,
			required: true
		},
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		dish: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Dish'
		}
	},
	{
		usePushEach: true,
		timestamps: true
	}
);

let Comments = mongoose.model('Comment', commentSchema);

module.exports = Comments;
