const db = require("../connection");

function fetchTopics() {
	return db.query("SELECT * FROM topics").then((response) => {
		return response.rows;
	});
}

function fetchArticles() {
	return db
		.query(
			"SELECT articles.article_id, COUNT(comments.article_id) AS comment_count FROM comments LEFT JOIN articles ON articles.article_id = comments.article_id GROUP BY articles.article_id"
		)
		.then((response) => {
			console.log(response.rows);
		});
	// return db
	// 	.query(
	// 		"SELECT author, title, article_id, topic, created_at, votes, article_img_url FROM articles ORDER BY created_at DESC"
	// 	)
	// 	.then((response) => {
	// 		return response.rows;
	// 	});
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

module.exports = { fetchTopics, fetchArticles, fetchArticleById };
