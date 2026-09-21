const { PrismaClient } = require("@prisma/client");

async function main() {
  const p = new PrismaClient();
  const result = {
    kana: await p.kana.count(),
    lessons: await p.lesson.count(),
    missions: await p.dailyMission.count(),
    journey: await p.journeyLocation.count(),
    achievements: await p.achievement.count(),
  };
  console.log(JSON.stringify(result));
  await p.$disconnect();
}

main();
