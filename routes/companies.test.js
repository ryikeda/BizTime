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

describe("test test", () => {
  test("test", async () => {
    console.log(testCompany);
    expect(1).toEqual(1);
  });
});
