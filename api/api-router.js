const apiRouter = require("express").Router();
const articlesRouter = require("./articles-router");
const endpoints = require("../endpoints.json");
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

apiRouter.get("/", (request, response) => {
	response.status(200).send({ endpoints });
});

apiRouter.get("/topics", getTopics);

apiRouter.get("/users", getUsers);

apiRouter.use("/articles", articlesRouter);

apiRouter.delete("/comments/:comment_id", deleteComment);

module.exports = apiRouter;
