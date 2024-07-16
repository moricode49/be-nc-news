const db = require("../connection");

function fetchTopics() {
	return db.query("SELECT * FROM topics").then((response) => {
		return response.rows;
	});
}

function fetchArticles() {
	return db
		.query(
			"SELECT articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.article_id) AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id GROUP BY articles.article_id  ORDER BY created_at DESC"
		)
		.then((response) => {
			return response.rows;
		});
}

function fetchArticleById(articleId) {
	return db
		.query("SELECT * FROM articles WHERE article_id = $1", [articleId])
		.then((response) => {
			if (response.rows.length === 0) {
				return Promise.reject({ status: 404, msg: "article does not exist" });
			}
			return response.rows[0];
		});
}

function fetchCommentsByArticleId(articleId) {
	return db
		.query(
			"SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC",
			[articleId]
		)
		.then((response) => {
			if (response.rows.length === 0) {
				return Promise.reject({ status: 404, msg: "article does not exist" });
			}
			return response.rows;
		});
}

module.exports = {
	fetchTopics,
	fetchArticles,
	fetchArticleById,
	fetchCommentsByArticleId,
};
