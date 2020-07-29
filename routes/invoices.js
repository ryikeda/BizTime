const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

// GET Routes
router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM invoices ORDER BY id`);
    return res.json({ invoices: results.rows });
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const results = await db.query(
      `SELECT i.id, i.comp_code, i.amt, i.paid, i.add_date, c.name, c.description FROM invoices AS i JOIN companies AS c on (i.comp_code = c.code) WHERE id=$1`,
      [id]
    );
    if (!results.rows.length)
      throw new ExpressError(`Invoice with id:${id} not found`, 404);
    const data = results.rows[0];
    const invoice = {
      id: data.id,
      amt: data.amt,
      paid: data.paid,
      add_date: data.add_date,
      company: {
        code: data.comp_code,
        name: data.name,
        description: data.description,
      },
    };
    return res.json({ invoice: invoice });
  } catch (err) {
    return next(err);
  }
});

// POST Route
router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const result = await db.query(
      `INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [comp_code, amt]
    );
    return res.json({ invoice: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// PUT Route
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amt } = req.body;
    const results = await db.query(
      `UPDATE invoices SET amt=$1 WHERE id=$2
      RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [amt, id]
    );
    if (!results.rows.length)
      throw new ExpressError(`Invoice with id:${id} not found`, 404);
    return res.json({ invoice: results.rows[0] });
  } catch (err) {
    return next(err);
  }
});
module.exports = router;
