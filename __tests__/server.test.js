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
					expect(body.topics).toEqual([
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
					expect(body.articles).toBeSortedBy("created_at", {
						descending: true,
					});
				});
		});
		test("object response doesn't contain a body property", () => {
			return request(app)
				.get("/api/articles")
				.expect(200)
				.then(({ body }) => {
					body.articles.forEach((article) => {
						expect(article).not.toHaveProperty("body");
					});
				});
		});
		test("An article object has a comment_count property with the total count of all the comments related to each article", () => {
			return request(app)
				.get("/api/articles")
				.expect(200)
				.then(({ body }) => {
					expect(body.articles[0]).toHaveProperty("comment_count", "2");
				});
		});
		describe("Queries", () => {
			describe("sort_by query", () => {
				test("?sort_by= responds with all the articles sorted by the requested query", () => {
					return request(app)
						.get("/api/articles?sort_by=author")
						.expect(200)
						.then(({ body }) => {
							expect(body.articles).toHaveLength(13);
							expect(body.articles).toBeSortedBy("author", {
								descending: true,
							});
						});
				});
				test("GET 404 responds with a 404 error when sort by query is invalid", () => {
					return request(app)
						.get("/api/articles?sort_by=not_a_column")
						.expect(400)
						.then(({ body }) => {
							expect(body).toEqual({ msg: "Bad request" });
						});
				});
			});
			describe("order by query", () => {
				test("?sort_by= responds with all the articles ordered by order query", () => {
					return request(app)
						.get("/api/articles?order=asc")
						.expect(200)
						.then(({ body }) => {
							expect(body.articles).toHaveLength(13);
							expect(body.articles).toBeSortedBy("created_at", {
								ascending: true,
							});
						});
				});
				test("GET 400 responds with a 400 error when order query is invalid", () => {
					return request(app)
						.get("/api/articles?order=not_a_valid_order")
						.expect(400)
						.then(({ body }) => {
							expect(body).toEqual({ msg: "Bad request" });
						});
				});
			});
			describe("topic query", () => {
				test("?topic= responds with articles filtered by requested topic query", () => {
					return request(app)
						.get("/api/articles?topic=cats")
						.expect(200)
						.then(({ body }) => {
							body.articles.forEach((article) => {
								expect(body.articles).toHaveLength(1);
								expect(article).toMatchObject({ topic: "cats" });
							});
						});
				});
				test("?topic= responds with all articles if topic query is omitted", () => {
					return request(app)
						.get("/api/articles")
						.expect(200)
						.then(({ body }) => {
							expect(body.articles).toHaveLength(13);
						});
				});
				test("GET 404 responds with a 404 error if the queried topic isn't in the database", () => {
					return request(app)
						.get("/api/articles?topic=not-a-topic")
						.expect(404)
						.then(({ body }) => {
							expect(body.msg).toBe("Topic not found");
						});
				});
				test("GET 200 responds with an empty array if the queried topic exists in the database but there are currently no articles associated with it", () => {
					return request(app)
						.get("/api/articles?topic=paper")
						.expect(200)
						.then(({ body }) => {
							expect(body.articles).toEqual([]);
						});
				});
			});
		});
	});
	describe("GET, responds with article by Id", () => {
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
		test("GET 200, responds with an article containing a comment count when requested with article_id", () => {
			return request(app)
				.get("/api/articles/1")
				.expect(200)
				.then(({ body }) => {
					expect(body).toHaveProperty("comment_count");
				});
		});
		test.only("GET 400, responds with a 400 error when requested with wrong data type", () => {
			return request(app)
				.get("/api/articles/not_a_number")
				.expect(400)
				.then(({ body }) => {
					expect(body.msg).toBe("Bad request");
				});
		});
		test.only("GET 404, responds with a 404 error when requested with an id that doesn't exist", () => {
			return request(app)
				.get("/api/articles/9000")
				.expect(404)
				.then(({ body }) => {
					expect(body.msg).toBe("article does not exist");
				});
		});
	});
});

describe("/api/users", () => {
	describe("GET", () => {
		test("GET 200, responds with an array of all users", () => {
			return request(app)
				.get("/api/users")
				.expect(200)
				.then(({ body }) => {
					body.users.forEach((user) => {
						expect(user).toMatchObject({
							username: expect.any(String),
							name: expect.any(String),
							avatar_url: expect.any(String),
						});
					});
				});
		});
	});
});

describe("/api/articles/:article_id", () => {
	describe("PATCH", () => {
		test("PATCH 200, increases the votes value on an article when given an article_id and returns the updated article", () => {
			const body = { inc_votes: 1 };
			return request(app)
				.patch("/api/articles/3")
				.send(body)
				.expect(200)
				.then(({ body }) => {
					expect(body).toEqual({
						article_id: 3,
						title: "Eight pug gifs that remind me of mitch",
						topic: "mitch",
						author: "icellusedkars",
						body: "some gifs",
						created_at: "2020-11-03T09:12:00.000Z",
						article_img_url:
							"https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
						votes: 1,
					});
				});
		});
		test("PATCH 200, decreases the votes value on an article if given a negative number when given an article_id and returns the updated article", () => {
			const body = { inc_votes: -1 };
			return request(app)
				.patch("/api/articles/1")
				.send(body)
				.expect(200)
				.then(({ body }) => {
					expect(body.votes).toBe(99);
				});
		});
		test("PATCH 400, responds with a 400 error if the body doesn't contain correct fields", () => {
			const body = {};
			return request(app)
				.patch("/api/articles/3")
				.send(body)
				.expect(400)
				.then(({ body }) => {
					expect(body.msg).toBe("Bad request");
				});
		});
		test("PATCH 400, responds with a 400 error if there is valid body fields but with invalid values", () => {
			const body = { inc_votes: "not_a_number" };
			return request(app)
				.patch("/api/articles/3")
				.send(body)
				.expect(400)
				.then(({ body }) => {
					expect(body.msg).toBe("Bad request");
				});
		});
		test("PATCH 400, responds with a 400 error when article_id is the wrong data type", () => {
			const body = { inc_votes: 1 };
			return request(app)
				.patch("/api/articles/not_a_number")
				.send(body)
				.expect(400)
				.then(({ body }) => {
					expect(body.msg).toBe("Bad request");
				});
		});
		test("PATCH 404, responds with a 404 error when requested with an article_id that doesn't exist", () => {
			const body = { inc_votes: 1 };
			return request(app)
				.patch("/api/articles/9000")
				.send(body)
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

describe("/api/comments/:comment_id", () => {
	describe("DELETE", () => {
		test("DELETE 204, responds with a status of 204 and no content when a comment is deleted", () => {
			return request(app).delete("/api/comments/4").expect(204);
		});
		test("DELETE 400, responds with a 400 error when requested with wrong data type", () => {
			return request(app)
				.delete("/api/comments/not_a_number")
				.expect(400)
				.then(({ body }) => {
					expect(body.msg).toBe("Bad request");
				});
		});
		test("DELETE 404, responds with a 404 error when requested with an id that doesn't exist", () => {
			return request(app)
				.delete("/api/comments/9000")
				.expect(404)
				.then(({ body }) => {
					expect(body.msg).toBe("comment does not exist");
				});
		});
	});
});
