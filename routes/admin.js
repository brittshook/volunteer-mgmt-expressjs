const express = require("express");
const router = express.Router();

const users = require("../data/users");
const error = require("../utils/error");

router.patch("/approve/:userId/?", (req, res, next) => {
  const userId = req.params.userId;
  const status = req.body.status;

  const user = users.find((user) => user.id == userId);
  if (userId && status) {
    if (user) {
      user.status = status;
    } else {
      next(error(404, "User not found"));
    }
  } else {
    next(error(400, "Insufficient data"));
  }
});

module.exports = router;
