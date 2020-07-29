process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testInvoice;

beforeEach(async () => {
  const compResults = await db.query(
    `INSERT INTO companies
    VALUES ('inv_test_code', 'Test Company', 'Maker of tests.')`
  );
  const invResults = await db.query(
    `INSERT INTO invoices (comp_code, amt, paid, paid_date) VALUES ('inv_test_code', 999, true, '1999-12-31') RETURNING comp_code, amt, paid, paid_date`
  );
  testInvoice = invResults.rows[0];
});

afterEach(async () => {
  await db.query(`DELETE FROM invoices`);
  await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
  await db.end();
});

// GET Routes
describe("GET /invoices", () => {
  test("Get a list of one invoice", async () => {
    const response = await request(app).get("/invoices");
    expect(response.statusCode).toBe(200);
    expect(response.body.invoices[0].comp_code).toEqual("inv_test_code");
    expect(response.body.invoices[0].amt).toEqual(999);
  });
});

describe("GET /invoices/:id", () => {
  test("Gets a one invoice", async () => {
    const response = await request(app).get(`/invoices`);
    expect(response.statusCode).toBe(200);
    expect(response.body.invoices[0].comp_code).toBe("inv_test_code");
  });
  test("Responds with 404 for invalid code", async () => {
    const response = await request(app).put(`/inventory/0`);
    expect(response.statusCode).toEqual(404);
  });
});

// POST Route
describe("POST /invoices", () => {
  test("Creates a single invoice", async () => {
    const response = await request(app)
      .post("/invoices")
      .send({ comp_code: "inv_test_code", amt: 111 });
    expect(response.statusCode).toBe(201);
    expect(response.body.invoice.comp_code).toBe("inv_test_code");
    expect(response.body.invoice.amt).toBe(111);
  });
});
