const express = require("express");
const shortUUID = require("short-unique-id");
const router = express.Router();

const users = require("../data/users");
const shifts = require("../data/shifts");
const error = require("../utils/error");

router
  .route("/")
  .get((req, res) => {
    res.json({ users: users });
  })
  .post((req, res, next) => {
    const firstName = req.body.first;
    const lastName = req.body.last;
    const email = req.body.email;
    const address = req.body.address;
    const role = req.body.role;
    const status = "pending";

    if (firstName && lastName && email && address && role) {
      if (users.find((user) => user.email == email)) {
        next(error(409, "User already exists"));
      }

      const uuid = new shortUUID({ length: 8 });

      const user = {
        id: uuid,
        first: firstName,
        last: lastName,
        email: email,
        address: address,
        role: role,
        status: status,
      };

      users.push(user);
      res.json(user);
    } else next(error(400, "Insufficient data"));
  });

router
  .route("/:userId/?")
  .get((req, res, next) => {
    const userId = req.params.userId;
    const user = users.find((user) => user.id == userId);

    if (user) {
      res.json({ user: user });
    } else next();
  })
  .patch((req, res, next) => {
    const user = users.find((user, i) => {
      if (user.id == req.params.userId) {
        for (const key in req.body) {
          users[i][key] = req.body[key];
        }
        return true;
      }
    });

    if (user) {
      res.json(user);
    } else {
      next();
    }
  })
  .delete((req, res, next) => {
    const user = users.find((user, i) => {
      if (user.id == req.params.userId) {
        users.splice(i, 1);
        return true;
      }
    });

    if (user) {
      res.json(user);
    } else {
      next();
    }
  });

router
  .route("/:userId/shifts/?")
  .get((req, res, next) => {
    const userId = req.params.userId;
    const user = users.find((user) => user.id == userId);

    if (user) {
      if (user.shifts) {
        res.json({ shifts: user.shifts });
      } else {
        next(error(404, "No shifts found"));
      }
    } else {
      next();
    }
  })
  .post((req, res, next) => {
    const userId = req.params.userId;
    const user = users.find((user) => user.id == userId);

    if (user) {
      const shiftId = req.params.shiftId;
      const shift = shifts.find((shift) => shift.id == shiftId);

      if (shift) {
        user.shifts.push(shift);
        res.json({ shifts: user.shifts });
      } else {
        next(error(404, "Shift not found"));
      }
    } else {
      next();
    }
  })
  .delete((req, res, next) => {
    const userId = req.params.userId;
    const shiftId = req.params.shiftId;

    const user = users.find((user) => user.id == userId);

    if (user) {
      const shift = user.shifts.find((shift, i) => {
        if (shift.id == shiftId) {
          user.shifts.splice(i, 1);
          return true;
        }
      });

      if (shift) {
        res.status(204).end();
      } else {
        next(error(404, "Shift not found"));
      }
    } else {
      next();
    }
  });

module.exports = router;
