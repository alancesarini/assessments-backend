const mongoose = require('mongoose');

const answerSchema = mongoose.Schema({
	text: {
		type: String,
	},
	startTime: {
		type: Date,
	},
	endTime: {
		type: Date,
	},
});

const questionSchema = mongoose.Schema({
	questionText: {
		type: String,
		trim: true,
	},
	imageUrl: String,
	maxTime: {
		type: Number,
		default: 0,
	},
	pasteAllowed: Boolean,
	answer: answerSchema,
});

const testSchema = mongoose.Schema({
	title: String,
	instructions: [String],
	questions: [questionSchema],
});

const Test = mongoose.model('Test', testSchema);

module.exports = Test;
