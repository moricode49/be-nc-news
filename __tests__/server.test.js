const db = require("../db/connection");
const request = require("supertest");
const app = require("../db/app");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");
const endpoints = require("../endpoints.json");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("/api", () => {
	test("GET 200, responds with all the avalable endpoints", () => {
		return request(app)
			.get("/api")
			.expect(200)
			.then(({ body }) => {
				expect(body.endpoints).toEqual(endpoints);
			});
	});
});

describe("/api/topics", () => {
	describe("GET", () => {
		test("GET 200, responds with all the topics", () => {
			return request(app)
				.get("/api/topics")
				.expect(200)
				.then(({ body }) => {
					expect(body).toEqual([
						{
							description: "The man, the Mitch, the legend",
							slug: "mitch",
						},
						{
							description: "Not dogs",
							slug: "cats",
						},
						{
							description: "what books are made of",
							slug: "paper",
						},
					]);
				});
		});
	});
});

describe("/api/articles", () => {
	describe("GET", () => {
		test("GET 200, responds with all the articles sorted by date (descending)", () => {
			return request(app)
				.get("/api/articles")
				.expect(200)
				.then(({ body }) => {
					expect(body).toBeSortedBy("created_at", { descending: true });
				});
		});
		test("object response doesn't contain a body property", () => {
			return request(app)
				.get("/api/articles")
				.expect(200)
				.then(({ body }) => {
					body.forEach((article) => {
						expect(article).not.toHaveProperty("body");
					});
				});
		});
		test("An article object has a comment_count property with the total count of all the comments related to each article", () => {
			return request(app)
				.get("/api/articles")
				.expect(200)
				.then(({ body }) => {
					expect(body[0]).toHaveProperty("comment_count", "2");
				});
		});
		describe("GET, responds with article by Id", () => {});
		test("GET 200, responds with an article when requested with article_id", () => {
			return request(app)
				.get("/api/articles/1")
				.expect(200)
				.then(({ body }) => {
					expect(body).toHaveProperty("article_id", 1);
					expect(body).toHaveProperty("title");
					expect(body).toHaveProperty("topic");
					expect(body).toHaveProperty("author");
					expect(body).toHaveProperty("body");
					expect(body).toHaveProperty("created_at");
					expect(body).toHaveProperty("votes");
					expect(body).toHaveProperty("article_img_url");
				});
		});
		test("GET 400, responds with a 400 error when requested with wrong data type", () => {
			return request(app)
				.get("/api/articles/not_a_number")
				.expect(400)
				.then(({ body }) => {
					expect(body.msg).toBe("Bad request");
				});
		});
		test("GET 404, responds with a 404 error when requested with an id that doesn't exist", () => {
			return request(app)
				.get("/api/articles/9000")
				.expect(404)
				.then(({ body }) => {
					expect(body.msg).toBe("article does not exist");
				});
		});
	});
});

describe("/api/articles/:article_id/comments", () => {
	describe("GET", () => {
		test("GET 200, responds with all comments for a given article", () => {
			return request(app)
				.get("/api/articles/3/comments")
				.expect(200)
				.then(({ body }) => {
					expect(body).toEqual([
						{
							comment_id: 11,
							body: "Ambidextrous marsupial",
							article_id: 3,
							author: "icellusedkars",
							votes: 0,
							created_at: "2020-09-19T23:10:00.000Z",
						},
						{
							comment_id: 10,
							body: "git push origin master",
							article_id: 3,
							author: "icellusedkars",
							votes: 0,
							created_at: "2020-06-20T07:24:00.000Z",
						},
					]);
				});
		});
		test("GET 400, responds with a 400 error when requested with wrong data type", () => {
			return request(app)
				.get("/api/articles/not_a_number/comments")
				.expect(400)
				.then(({ body }) => {
					expect(body.msg).toBe("Bad request");
				});
		});
		test("GET 404, responds with a 404 error when requested with an id that doesn't exist", () => {
			return request(app)
				.get("/api/articles/9000/comments")
				.expect(404)
				.then(({ body }) => {
					expect(body.msg).toBe("article does not exist");
				});
		});
	});
	describe("POST", () => {
		test("POST 200, responds with newly posted comment", () => {
			const body = { username: "butter_bridge", body: "new comment" };
			return request(app)
				.post("/api/articles/3/comments")
				.send(body)
				.expect(201)
				.then(({ body }) => {
					expect(body).toEqual({
						comment_id: expect.any(Number),
						body: "new comment",
						article_id: 3,
						author: "butter_bridge",
						votes: 0,
						created_at: expect.any(String),
					});
				});
		});
		test("POST 400, responds with a 400 error if the body doesn't contain correct fields", () => {
			const body = {};
			return request(app)
				.post("/api/articles/3/comments")
				.send(body)
				.expect(400)
				.then(({ body }) => {
					expect(body.msg).toBe("Bad request");
				});
		});
		test("POST 404, responds with a 404 error if the username value is invalid", () => {
			const body = { username: "invalid_username", body: "new comment" };
			return request(app)
				.post("/api/articles/3/comments")
				.send(body)
				.expect(404)
				.then(({ body }) => {
					expect(body.msg).toBe("not found");
				});
		});
		test("POST 400, responds with a 400 error when article_id is the wrong data type", () => {
			const body = { username: "butter_bridge", body: "new comment" };
			return request(app)
				.post("/api/articles/not_a_number/comments")
				.send(body)
				.expect(400)
				.then(({ body }) => {
					expect(body.msg).toBe("Bad request");
				});
		});
		test("POST 404, responds with a 404 error when requested with an article_id that doesn't exist", () => {
			const body = { username: "butter_bridge", body: "new comment" };
			return request(app)
				.post("/api/articles/9000/comments")
				.send(body)
				.expect(404)
				.then(({ body }) => {
					expect(body.msg).toBe("not found");
				});
		});
	});
});
