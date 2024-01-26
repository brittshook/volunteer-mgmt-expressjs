const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();

const users = require("../data/users");
const shifts = require("../data/shifts");
const error = require("../utils/error");

router
  .route("/")
  .get((req, res) => {
    const status = req.query.status;
    const role = req.query.role;

    if (status) {
      const usersByStatus = users.filter((user) => user.status == status);
      res.json({ users: usersByStatus });
    }

    if (role) {
      const usersByRole = users.filter((user) => {
        for (const userRole of user.role) {
          if (userRole == role) {
            return true;
          }
        }
      });
      res.json({ users: usersByRole });
    }

    res.json({ users: users });
  })
  .post((req, res, next) => {
    const { first, last, email, address, role } = req.body;
    const status = "pending";

    if (first && last && email && address && role) {
      if (users.find((user) => user.email == email)) {
        if (req.accepts("html")) {
          res.render("form.mustache", {
            error: "Account already exists. Try signing in instead.",
          });
        } else {
          next(error(409, "User already exists"));
        }
      }

      const uuid = uuidv4().slice(0, 8);

      const user = {
        id: uuid,
        first: first,
        last: last,
        email: email,
        address: address,
        role: role,
        status: status,
      };

      users.push(user);
      if (req.accepts("html")) {
        res.render("success.mustache");
      } else {
        res.json({ user: user });
      }
    } else {
      if (req.accepts("html")) {
        res.render("form.mustache", {
          error: "Please fill out all fields.",
        });
      } else {
        next(error(400, "Insufficient data"));
      }
    }
  });

router
  .route("/:userId/?")
  .get((req, res, next) => {
    const userId = req.params.userId;
    const user = users.find((user) => user.id == userId);

    if (user) {
      res.json({ user: user });
    } else next(error(404, "User not found"));
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
    const userIndex = users.findIndex((user) => user.id == req.params.userId);

    if (userIndex != -1) {
      users.splice(userIndex, 1);
      res.status(204).end();
    } else {
      next(error(404, "User not found"));
    }
  });

router
  .route("/:userId/shifts/?")
  .get((req, res, next) => {
    const userId = req.params.userId;
    const startTime = req.query.startTime;
    const endTime = req.query.endTime;
    const user = users.find((user) => user.id == userId);

    if (user) {
      if (user.shifts) {
        if (startTime && endTime) {
          const filteredShifts = user.shifts.filter((shift) => {
            return shift.startTime >= startTime && shift.endTime <= endTime;
          });
          res.json({ shifts: filteredShifts });
        } else if (startTime || endTime) {
          next(
            error(
              400,
              "To filter by time range, both start time and end time must be provided"
            )
          );
        } else {
          res.json({ shifts: user.shifts });
        }
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
      const shiftId = req.body.shiftId;
      const shift = shifts.find((shift) => shift.id == shiftId);

      if (shift) {
        if (!user.hasOwnProperty("shifts")) {
          user.shifts = [];
        }
        user.shifts.push(shift);
        res.json({ shifts: user.shifts });
      } else {
        next(error(404, "Shift not found"));
      }
    } else {
      next(error(404, "User not found"));
    }
  });

router.delete("/:userId/shifts/:shiftId/?", (req, res, next) => {
  const userId = req.params.userId;
  const user = users.find((user) => user.id == userId);

  if (user) {
    const shiftIndex = user.shifts.findIndex(
      (shift) => shift.id == req.params.shiftId
    );

    if (shiftIndex != -1) {
      user.shifts.splice(shiftIndex, 1);
      res.status(204).end();
    } else {
      next(error(404, "Shift not found"));
    }
  }
});

module.exports = router;
