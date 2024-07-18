const {
	fetchTopics,
	fetchArticleById,
	fetchArticles,
	fetchCommentsByArticleId,
	newComment,
	updateArticle,
	removeComment,
	fetchUsers,
	selectTopics,
} = require("../models/topics.models");

function getTopics(request, response) {
	return fetchTopics().then((topics) => {
		response.status(200).send({ topics });
	});
}

function getArticles(request, response, next) {
	const { sort_by, order, topic } = request.query;
	if (topic) {
		return selectTopics(topic)
			.then(() => {
				return fetchArticles(sort_by, order, topic)
					.then((articles) => {
						response.status(200).send({ articles });
					})
					.catch((error) => {
						next(error);
					});
			})
			.catch((error) => {
				next(error);
			});
	} else {
		return fetchArticles(sort_by, order)
			.then((articles) => {
				response.status(200).send({ articles });
			})
			.catch((error) => {
				next(error);
			});
	}
}

function getUsers(request, response) {
	return fetchUsers().then((users) => {
		response.status(200).send({ users });
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
	getUsers,
};
