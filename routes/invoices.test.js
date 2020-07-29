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

describe("test test", () => {
  test("test", async () => {
    expect(1).toEqual(1);
  });
});
