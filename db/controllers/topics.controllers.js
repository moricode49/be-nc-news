const {
	fetchTopics,
	fetchArticleById,
	fetchArticles,
	fetchCommentsByArticleId,
	newComment,
} = require("../models/topics.models");

function getTopics(request, response, next) {
	return fetchTopics().then((topics) => {
		response.status(200).send(topics);
	});
}

function getArticles(request, response, next) {
	return fetchArticles().then((articles) => {
		response.status(200).send(articles);
	});
}

function getArticleById(request, response, next) {
	const articleId = request.params.article_id;
	return fetchArticleById(articleId)
		.then((article) => {
			response.status(200).send(article);
		})
		.catch((error) => {
			next(error);
		});
}

function getCommentsByArticleId(request, response, next) {
	const articleId = request.params.article_id;
	return fetchCommentsByArticleId(articleId)
		.then((comments) => {
			response.status(200).send(comments);
		})
		.catch((error) => {
			next(error);
		});
}

function postNewComment(request, response, next) {
	const articleId = request.params.article_id;
	const commentBody = request.body;
	return newComment(articleId, commentBody)
		.then((comment) => {
			response.status(201).send(comment);
		})
		.catch((error) => {
			if (error.code === "23503") {
				response.status(404).send({ msg: "not found" });
			}
			next(error);
		});
}

module.exports = {
	getTopics,
	getArticles,
	getArticleById,
	getCommentsByArticleId,
	postNewComment,
};
