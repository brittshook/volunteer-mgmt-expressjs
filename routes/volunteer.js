const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");


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
        id: programs.length + 1,
        name: programName,
      };

      programs.push(program);
      res.json({ program: program });
    } else {
      next(error(400, "Insufficient data"));
    }
  });

router.delete("/programs/:programId/?", (req, res, next) => {
  const programIndex = programs.findIndex(
    (program) => program.id == req.params.programId
  );

  if (programIndex != -1) {
    programs.splice(programIndex, 1);
    res.status(204).end();
  } else {
    next(error(404, "Program not found"));
  }
});

router
  .route("/shifts/?")
  .get((req, res, next) => {
    res.json({ shifts: shifts });
  })
  .post((req, res, next) => {
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

      const uuid = uuidv4().slice(0, 8);

      const shift = {
        id: uuid,
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
    } else next(error(404, "Shift not found"));
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
    const shiftIndex = shifts.findIndex(
      (shift) => shift.id == req.params.shiftId
    );

    if (shiftIndex != -1) {
      shifts.splice(shiftIndex, 1);
      res.status(204).end();
    } else {
      next(error(404, "Shift not found"));
    }
  });

module.exports = router;
