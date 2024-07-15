const db = require("../connection");

function fetchTopics() {
	return db.query("SELECT * FROM topics").then((response) => {
		return response.rows;
	});
}

module.exports = { fetchTopics };
