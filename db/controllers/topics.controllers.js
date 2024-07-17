const {
	fetchTopics,
	fetchArticleById,
	fetchArticles,
	fetchCommentsByArticleId,
	newComment,
	updateArticle,
	removeComment,
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
			next(error);
		});
}

function updateArticleById(request, response, next) {
	const articleId = request.params.article_id;
	const votes = request.body.inc_votes;
	return updateArticle(articleId, votes)
		.then((article) => {
			response.status(200).send(article);
		})
		.catch((error) => {
			next(error);
		});
}

function deleteComment(request, response, next) {
	const commentId = request.params.comment_id;
	return removeComment(commentId)
		.then(() => {
			response.status(204).send();
		})
		.catch((error) => {
			next(error);
		});
}

module.exports = {
	getTopics,
	getArticles,
	getArticleById,
	getCommentsByArticleId,
	postNewComment,
	updateArticleById,
	deleteComment,
};
