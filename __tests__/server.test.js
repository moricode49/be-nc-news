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
		describe("GET article by Id", () => {
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
});
