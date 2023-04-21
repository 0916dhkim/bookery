import { CoachService } from "../service/coach-service";
import { Context } from "./handler";

export const getCoachHandler =
  (coachService: CoachService) =>
  async (context: Context<unknown, {id: string}>) => {
    if (context.params.id !== context.session?.id) {
      return {
        status: 403,
        body: "Forbidden",
      };
    }
    const coach = await coachService.getCoach(context.params.id);
    return {
      status: 200,
      body: { coach },
    };
  };
