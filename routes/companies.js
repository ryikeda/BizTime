const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

// GET Routes
router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM companies`);
    return res.json({ companies: results.rows });
  } catch (err) {
    return next(err);
  }
});

router.get("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const compResults = await db.query(
      `SELECT * FROM companies WHERE code=$1`,
      [code]
    );
    const invResults = await db.query(
      `SELECT id FROM invoices WHERE comp_code=$1`,
      [code]
    );
    if (!compResults.rows.length)
      throw new ExpressError(`No company found with code: ${code}`, 404);
    const company = compResults.rows[0];
    const invoices = invResults.rows;
    company.invoices = invoices.map((inv) => inv.id);

    return res.send({ company });
  } catch (err) {
    return next(err);
  }
});

// POST Routes
router.post("/", async (req, res, next) => {
  try {
    const { code, name, description } = req.body;
    const results = await db.query(
      `INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`,
      [code, name, description]
    );
    return res.status(201).json({ company: results.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// PUT Routes
router.put("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;
    const results = await db.query(
      `UPDATE companies SET name=$1, description=$2 WHERE code =$3 RETURNING code, name, description`,
      [name, description, code]
    );
    if (!results.rows.length)
      throw new ExpressError(`No company found with code: ${code}`, 404);
    return res.send({ company: results.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// DELETE Route
router.delete("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const results = await db.query(
      `DELETE FROM companies WHERE code=$1 RETURNING name`,
      [code]
    );
    if (!results.rows.length)
      throw new ExpressError(`No company found with code: ${code}`, 404);
    return res.send({ msg: `Company with code: ${code} is gone!` });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
