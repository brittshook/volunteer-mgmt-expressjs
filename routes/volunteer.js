const express = require("express");
const router = express.Router();

const shifts = require("../data/shifts");
const programs = require("../data/programs");
const error = require("../utils/error");

router
  .route("/programs/?")
  .get((req, res, next) => {
    res.json({ programs: programs });
  })
  .post((req, res, next) => {
    const programName = req.body.name;

    if (programName) {
      if (programs.find((program) => program.name == programName)) {
        next(error(409, "Program already exists"));
      }

      const program = {
        id: programs.length,
        name: programName,
      };

      programs.push(program);
      res.json({ program: program });
    } else {
      next(error(400, "Insufficient data"));
    }
  });

router.delete("/programs/:programId/?", (req, res, next) => {
  const program = programs.find((program, i) => {
    if (program.id == req.params.userId) {
      users.splice(i, 1);
      return true;
    }
  });

  if (program) {
    res.json(program);
  } else {
    next();
  }
});

router.post("/shifts/?", (req, res, next) => {
  const name = req.body.name;
  const program = req.body.program;
  const startTime = req.body.startTime;
  const endTime = req.body.endTime;
  const location = req.body.location;
  const volunteerLimit = req.body.volunteerLimit;

  if (name && program && startTime && endTime && volunteerLimit) {
    if (
      shifts.find(
        (shift) =>
          shift.name == name &&
          shift.program == program &&
          shift.startTime == startTime &&
          shift.endTime == endTime &&
          shift.location == location
      )
    ) {
      next(error(409, "Shift already exists"));
    }

    const shift = {
      id: programs.length,
      name: name,
      program: program,
      startTime: startTime,
      endTime: endTime,
      location: location,
      volunteerLimit: volunteerLimit,
    };

    shifts.push(shift);
    res.json({ shift: shift });
  } else {
    next(error(400, "Insufficient data"));
  }
});

router
  .route("/shifts/:shiftId/?")
  .get((req, res, next) => {
    const shiftId = req.params.shiftId;
    const shift = shifts.find((shift) => shift.id == shiftId);

    if (shift) {
      res.json({ shift: shift });
    } else next();
  })
  .put((req, res, next) => {
    const shiftId = req.params.shiftId;
    const existingShift = shifts.find((shift) => shift.id == shiftId);

    if (existingShift) {
      const name = req.body.name;
      const program = req.body.program;
      const startTime = req.body.startTime;
      const endTime = req.body.endTime;
      const location = req.body.location;
      const volunteerLimit = req.body.volunteerLimit;

      if (
        name &&
        program &&
        startTime &&
        endTime &&
        location &&
        volunteerLimit
      ) {
        const shift = {
          id: programs.length,
          name: name,
          program: program,
          startTime: startTime,
          endTime: endTime,
          location: location,
          volunteerLimit: volunteerLimit,
        };

        shifts.shiftId = shift;

        res.json({ shift: shift });
      } else {
        next(error(400, "Insufficient data"));
      }
    } else {
      next(error(404, "Shift not found"));
    }
  })
  .delete((req, res, next) => {
    const shift = shifts.find((shift, i) => {
      if (shift.id == req.params.shiftId) {
        shifts.splice(i, 1);
        return true;
      }
    });

    if (shift) {
      res.json(shift);
    } else {
      next();
    }
  });
