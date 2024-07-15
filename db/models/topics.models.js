const db = require("../connection");

function fetchTopics() {
	return db.query("SELECT * FROM topics").then((response) => {
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

module.exports = { fetchTopics, fetchArticleById };
