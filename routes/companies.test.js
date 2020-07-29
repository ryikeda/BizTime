process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testCompany;

beforeEach(async () => {
  const results = await db.query(
    `INSERT INTO companies
    VALUES ('test_code', 'Test Company', 'Maker of tests.') RETURNING code, name, description`
  );

  testCompany = results.rows[0];
});

afterEach(async () => {
  await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
  await db.end();
});

// GET Routes
describe("GET /companies", () => {
  test("Get a list of one company", async () => {
    const response = await request(app).get("/companies");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ companies: [testCompany] });
  });
});

describe("GET /companies/:code", () => {
  test("Gets a one company", async () => {
    testCompany.invoices = [];
    const response = await request(app).get(`/companies/${testCompany.code}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ company: testCompany });
  });
  test("Responds with 404 for invalid code", async () => {
    const response = await request(app).put(`/companies/0`);
    expect(response.statusCode).toEqual(404);
  });
});

// POST Route
describe("POST /companies", () => {
  test("Creates a single company", async () => {
    const res = await request(app)
      .post("/companies")
      .send({ code: "code", name: "company", description: "description" });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      company: {
        code: "code",
        name: "company",
        description: "description",
      },
    });
  });
});

// PUT Route
describe("PUT /companies/:code", () => {
  test("Updates a single company", async () => {
    const res = await request(app)
      .put(`/companies/${testCompany.code}`)
      .send({ name: "update_name", description: "update_description" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      company: {
        code: testCompany.code,
        name: "update_name",
        description: "update_description",
      },
    });
  });
  test("Responds with 404 for invalid code", async () => {
    const response = await request(app).put(`/companies/0`);
    expect(response.statusCode).toEqual(404);
  });
});

// DELETE Route
describe("DELETE /companies/:code", () => {
  test("Deltes a single company", async () => {
    const res = await request(app).delete(`/companies/${testCompany.code}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      msg: `Company with code: ${testCompany.code} is gone!`,
    });
  });
});
