import { NextFunction, Request, Response } from "express";

import { CoachService } from "../service/coach-service";

export const getCoachHandler =
  (coachService: CoachService) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {id} = req.params;
      if (id == null) {
        throw new Error("id is missing in URL params.");
      }
      if (id != req.session.coach?.id) {
        return res.sendStatus(403);
      }
      const coach = await coachService.getCoach(id);
      return res.send({ coach });
    } catch (e) {
      next(e);
    }
  }
