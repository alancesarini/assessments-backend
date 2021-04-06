const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Test = require('../models/test.model');

// ----------------------------------------------------------------------
// PUBLIC ROUTES
// ----------------------------------------------------------------------

// Get general info of a test
router.get('/tests/:testid', async (req, res) => {
	const test = await findTestOrDie(req, res);

	const testData = {
		title: test.title,
		instructions: test.instructions,
	};
	res.status(200).send(testData);
});

// Get the first question in a test that has not been visited yet
router.get('/tests/:testid/current', async (req, res) => {
	const test = await findTestOrDie(req, res);

	let questionIndex = -1;
	test.questions.every((question, index) => {
		if (question.answer.startTime === null) {
			questionIndex = index;
			return false;
		}
		return true;
	});

	if (questionIndex === -1) {
		res.status(404).send();
	}

	const question = test.questions[questionIndex];
	question.answer.startTime = new Date();
	test.questions[questionIndex] = question;

	try {
		await test.save();
		res.status(200).send({
			index: questionIndex + 1,
			questionText: test.questions[questionIndex].questionText,
			imageUrl: test.questions[questionIndex].imageUrl,
			maxTime: test.questions[questionIndex].maxTime,
		});
	} catch (e) {
		res.status(400).send();
	}
});

// Get a question in a test (by index)
router.get('/tests/:testid/questions/:questionindex', async (req, res) => {
	const test = await findTestOrDie(req, res);

	const questionIndex = Number.parseInt(req.params.questionindex) - 1;
	if (questionIndex > test.questions.length - 1 || questionIndex < 0) {
		res.status(400).send();
	}

	const question = test.questions[questionIndex];
	question.answer.startTime = new Date();
	test.questions[questionIndex] = question;

	try {
		await test.save();
		res.send({
			index: questionIndex + 1,
			questionText: test.questions[questionIndex].questionText,
			imageUrl: test.questions[questionIndex].imageUrl,
			maxTime: test.questions[questionIndex].maxTime,
		});
	} catch (e) {
		res.status(400).send();
	}
});

// Get the total number of questions in a test
router.get('/tests/:testid/count', async (req, res) => {
	const test = await findTestOrDie(req, res);

	const counter = {
		total: test.questions.length,
	};
	res.status(200).send(counter);
});

// Answer a question (by index) in a test
router.post(
	'/tests/:testid/questions/:questionindex/answer',
	async (req, res) => {
		const test = await findTestOrDie(req, res);

		const questionIndex = Number.parseInt(req.params.questionindex) - 1;
		if (questionIndex > test.questions.length - 1 || questionIndex < 0) {
			res.status(400).send();
		}

		const question = test.questions[questionIndex];
		if (!question) {
			res.status(404).send();
		}

		question.answer.text = req.body.answer;
		question.answer.endTime = new Date();
		test.questions[questionIndex] = question;

		try {
			await test.save();
			res.status(200).send(question);
		} catch (e) {
			res.status(400).send();
		}
	}
);

// ----------------------------------------------------------------------
// PRIVATE ROUTES
// ----------------------------------------------------------------------

// Add a test
router.post('/tests', async (req, res) => {
	const test = new Test({
		title: req.body.title,
		instructions: req.body.instructions,
		questions: [],
	});

	try {
		await test.save();
		res.status(200).send(test);
	} catch (e) {
		console.log(e);
		res.status(400).send();
	}
});

// Add a test with all questions
router.post('/tests/full', async (req, res) => {
	const questions = req.body.questions.map((question) => {
		question.answer = {
			text: '',
			startTime: null,
			endTime: null,
		};
	});

	const test = new Test({
		title: req.body.title,
		instructions: req.body.instructions,
		questions: questions,
	});

	try {
		await test.save();
		res.status(200).send(test);
	} catch (e) {
		console.log(e);
		res.status(400).send();
	}
});

// Add a question to a test
router.post('/tests/:testid/questions', async (req, res) => {
	const test = await findTestOrDie(req, res);
	const newQuestion = req.body;
	test.questions.push(newQuestion);

	try {
		await test.save();
		res.status(200).send();
	} catch (e) {
		res.status(400).send();
	}
});

// Get the test results
router.get('/tests/:testid/results', async (req, res) => {
	const test = await findTestOrDie(req, res);
	res.status(200).send(test);
});

// Get a test from query params. If the test doesn't exist, die with a 404
const findTestOrDie = async (req, res) => {
	const objectId = new mongoose.Types.ObjectId(req.params.testid);
	const test = await Test.findById(objectId);
	if (!test) {
		res.status(404).send();
	}

	return test;
};

module.exports = router;
