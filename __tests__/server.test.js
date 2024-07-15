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
