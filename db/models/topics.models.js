const db = require("../connection");
const format = require("pg-format");
const { checkExists } = require("../utils");

function fetchTopics() {
	return db.query("SELECT * FROM topics").then((response) => {
		return response.rows;
	});
}

selectTopics = async (topic) => {
	if (topic) {
		const output = await checkExists("topics", "slug", topic);
		if (output.length === 0) {
			return Promise.reject({ status: 404, msg: "Topic not found" });
		} else {
			return output;
		}
	}
};

function fetchArticles(sortBy = "created_at", order, topic) {
	let queryValues = [];
	const greenList = ["title", "topic", "author", "created_at"];
	if (!greenList.includes(sortBy)) {
		return Promise.reject({ status: 400, msg: "Bad request" });
	}

	let sqlString = `SELECT articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.article_id) AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id  `;

	if (topic !== undefined) {
		queryValues.push(topic);
		sqlString += `WHERE topic = $1 `;
	}

	sqlString += `GROUP BY articles.article_id`;

	sqlString += ` ORDER BY ${sortBy} `;
	if (order === "asc") {
		sqlString += `ASC`;
	} else if (order === "desc" || !order) {
		sqlString += `DESC`;
	} else {
		return Promise.reject({ status: 400, msg: "Bad request" });
	}

	return db.query(sqlString, queryValues).then((response) => {
		return response.rows;
	});
}

function fetchUsers() {
	return db.query("SELECT * FROM users").then((response) => {
		return response.rows;
	});
}

function fetchArticleById(articleId) {
	// let sqlString = `SELECT *, COUNT(comments.article_id) AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id  `;
	return (
		db
			.query(
				`SELECT articles.*, COUNT(comments.article_id) AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id WHERE articles.article_id = $1 GROUP BY articles.article_id`,
				[articleId]
			)
			// .query("SELECT * FROM articles WHERE article_id = $1", [articleId])
			.then((response) => {
				console.log(response);
				if (response.rows.length === 0) {
					return Promise.reject({ status: 404, msg: "article does not exist" });
				}
				return response.rows[0];
			})
	);
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

function newComment(articleId, commentBody) {
	const newCommentValuesArray = [
		commentBody.body,
		articleId,
		commentBody.username,
	];

	const formattedComments = format(
		"INSERT INTO comments(body, article_id, author) VALUES %L RETURNING *",
		[newCommentValuesArray]
	);
	return db.query(formattedComments).then((response) => {
		return response.rows[0];
	});
}

function updateArticle(article_id, votes) {
	return db
		.query(
			"UPDATE articles SET votes = votes + $2 WHERE article_id = $1 RETURNING *",
			[article_id, votes]
		)
		.then((response) => {
			if (response.rows.length === 0) {
				return Promise.reject({ status: 404, msg: "article does not exist" });
			}
			return response.rows[0];
		});
}

function removeComment(comment_id) {
	return db
		.query("DELETE FROM comments WHERE comment_id = $1 RETURNING *", [
			comment_id,
		])
		.then((response) => {
			if (response.rows.length === 0) {
				return Promise.reject({ status: 404, msg: "comment does not exist" });
			}
		});
}

module.exports = {
	fetchTopics,
	fetchArticles,
	fetchArticleById,
	fetchCommentsByArticleId,
	newComment,
	updateArticle,
	removeComment,
	fetchUsers,
	selectTopics,
};
