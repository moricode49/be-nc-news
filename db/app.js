const express = require("express");
const app = express();
const { getTopics } = require("./controllers/topics.controllers");

app.get("/api/topics", getTopics);

app.use((error, request, response, next) => {
	response.status(500).send({ msg: "Internal Server Error" });
});

module.exports = app;
