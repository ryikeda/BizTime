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
    const results = await db.query(`SELECT * FROM companies WHERE code=$1`, [
      code,
    ]);
    if (!results.rows.length)
      throw new ExpressError(`No company found with code: ${code}`, 404);
    return res.send({ company: results.rows[0] });
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
    debugger;
    return res.status(201).json({ company: results.rows[0] });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
