import { Coach, PrismaClient } from "@bookery/database";

import { CoachDto } from "@bookery/shared";

export function CoachService(prisma: PrismaClient) {
  async function getCoach(id: string) {
    const coach = await prisma.coach.findUnique({
      where: { id }
    });
    if (coach == null) {
      throw new Error(`Coach ${id} not found.`);
    }

    return assembleCoach(coach);
  }

  return {
    getCoach,
  };
}

function assembleCoach(coachRecord: Coach): CoachDto {
  return {
    id: coachRecord.id,
    displayName: coachRecord.displayName,
    email: coachRecord.email,
  };
}

export type CoachService = ReturnType<typeof CoachService>;
