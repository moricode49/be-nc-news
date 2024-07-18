const db = require("../db/connection");
const format = require("pg-format");

const checkExists = async (table, column, value) => {
	const queryStr = format("SELECT * FROM %I WHERE %I =$1", table, column);
	const dbOutput = await db.query(queryStr, [value]);
	return dbOutput.rows;
};

module.exports = { checkExists };
