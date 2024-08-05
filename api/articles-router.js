const articlesRouter = require("express").Router();
const {
	getTopics,
	getArticleById,
	getArticles,
	getCommentsByArticleId,
	postNewComment,
	updateArticleById,
	deleteComment,
	getUsers,
} = require("../db/controllers/topics.controllers");

articlesRouter.get("/", getArticles);

articlesRouter.get("/:article_id", getArticleById);

articlesRouter.get("/:article_id/comments", getCommentsByArticleId);

articlesRouter.post("/:article_id/comments", postNewComment);

articlesRouter.patch("/:article_id", updateArticleById);

module.exports = articlesRouter;
