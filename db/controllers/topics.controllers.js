const {
	fetchTopics,
	fetchArticleById,
	fetchArticles,
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

module.exports = { getTopics, getArticles, getArticleById };
