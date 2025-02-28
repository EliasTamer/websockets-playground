const db = require("../database");

exports.getProducts = async (req, res, next) => {
  try {
    const query = "SELECT * FROM PRODUCT";

    const results = await new Promise((resolve, reject) => {
      db.query(query, [], (error, results) => {
        if (error) reject(error);
        resolve(results);
      });
    });

    return res.status(201).json({ data: results });
  } catch (error) {
    next(error);
  }
};
