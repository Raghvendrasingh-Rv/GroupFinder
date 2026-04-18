import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? ""
  })
});

async function main() {
  await prisma.participant.deleteMany();
  await prisma.request.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  const users = await prisma.$transaction([
    prisma.user.create({
      data: { email: "aarav@example.com", username: "Aarav", mobileNumber: "9000000001", latitude: 12.9716, longitude: 77.5946 }
    }),
    prisma.user.create({
      data: { email: "diya@example.com", username: "Diya", mobileNumber: "9000000002", latitude: 12.9352, longitude: 77.6245 }
    }),
    prisma.user.create({
      data: { email: "kabir@example.com", username: "Kabir", mobileNumber: "9000000003", latitude: 12.9279, longitude: 77.6271 }
    }),
    prisma.user.create({
      data: { email: "meera@example.com", username: "Meera", mobileNumber: "9000000004", latitude: 12.9718, longitude: 77.6412 }
    }),
    prisma.user.create({
      data: { email: "arjun@example.com", username: "Arjun", mobileNumber: "9000000005", latitude: 12.9081, longitude: 77.6476 }
    })
  ]);

  const [u1, u2, u3, u4, u5] = users;

  const events = await prisma.$transaction([
    prisma.event.create({
      data: {
        creatorId: u1.id,
        category: "Tech",
        title: "React Builders Meetup",
        description: "A meetup for React and frontend enthusiasts.",
        eventAddress: "Koramangala, Bengaluru",
        eventDate: new Date("2026-04-10T00:00:00.000Z"),
        eventTime: "10:00",
        maxParticipants: 30
      }
    }),
    prisma.event.create({
      data: {
        creatorId: u1.id,
        category: "Startup",
        title: "Founder Coffee Chat",
        description: "Casual conversations about startup building.",
        eventAddress: "Indiranagar, Bengaluru",
        eventDate: new Date("2026-04-12T00:00:00.000Z"),
        eventTime: "09:30",
        maxParticipants: 20
      }
    }),
    prisma.event.create({
      data: {
        creatorId: u2.id,
        category: "Sports",
        title: "Sunday Football",
        description: "Friendly football match in the morning.",
        eventAddress: "HSR Layout, Bengaluru",
        eventDate: new Date("2026-04-13T00:00:00.000Z"),
        eventTime: "07:00",
        maxParticipants: 22
      }
    }),
    prisma.event.create({
      data: {
        creatorId: u2.id,
        category: "Music",
        title: "Open Mic Night",
        description: "Poetry, music, and performances.",
        eventAddress: "Whitefield, Bengaluru",
        eventDate: new Date("2026-04-14T00:00:00.000Z"),
        eventTime: "18:30",
        maxParticipants: 50
      }
    }),
    prisma.event.create({
      data: {
        creatorId: u3.id,
        category: "Food",
        title: "Street Food Walk",
        description: "Explore local food spots together.",
        eventAddress: "Jayanagar, Bengaluru",
        eventDate: new Date("2026-04-15T00:00:00.000Z"),
        eventTime: "19:00",
        maxParticipants: 15
      }
    }),
    prisma.event.create({
      data: {
        creatorId: u3.id,
        category: "Education",
        title: "AI Study Circle",
        description: "Learn and share AI resources.",
        eventAddress: "Malleshwaram, Bengaluru",
        eventDate: new Date("2026-04-16T00:00:00.000Z"),
        eventTime: "16:00",
        maxParticipants: 12
      }
    }),
    prisma.event.create({
      data: {
        creatorId: u4.id,
        category: "Wellness",
        title: "Morning Yoga",
        description: "Beginner-friendly yoga session.",
        eventAddress: "JP Nagar, Bengaluru",
        eventDate: new Date("2026-04-17T00:00:00.000Z"),
        eventTime: "06:30",
        maxParticipants: 25
      }
    }),
    prisma.event.create({
      data: {
        creatorId: u4.id,
        category: "Art",
        title: "Sketch in the Park",
        description: "Outdoor sketching and creative time.",
        eventAddress: "Cubbon Park, Bengaluru",
        eventDate: new Date("2026-04-18T00:00:00.000Z"),
        eventTime: "15:00",
        maxParticipants: 18
      }
    }),
    prisma.event.create({
      data: {
        creatorId: u5.id,
        category: "Networking",
        title: "Product People Mixer",
        description: "Meet product managers and designers.",
        eventAddress: "MG Road, Bengaluru",
        eventDate: new Date("2026-04-19T00:00:00.000Z"),
        eventTime: "17:00",
        maxParticipants: 40
      }
    }),
    prisma.event.create({
      data: {
        creatorId: u5.id,
        category: "Travel",
        title: "Weekend Trek Planning",
        description: "Plan a weekend trek with the group.",
        eventAddress: "Banashankari, Bengaluru",
        eventDate: new Date("2026-04-20T00:00:00.000Z"),
        eventTime: "11:00",
        maxParticipants: 10
      }
    })
  ]);

  await prisma.$transaction([
    prisma.request.create({
      data: {
        eventId: events[0].id,
        userId: u2.id,
        status: "PENDING"
      }
    }),
    prisma.request.create({
      data: {
        eventId: events[0].id,
        userId: u3.id,
        status: "ACCEPTED"
      }
    }),
    prisma.request.create({
      data: {
        eventId: events[2].id,
        userId: u4.id,
        status: "REJECTED"
      }
    }),
    prisma.request.create({
      data: {
        eventId: events[4].id,
        userId: u1.id,
        status: "PENDING"
      }
    }),
    prisma.request.create({
      data: {
        eventId: events[8].id,
        userId: u2.id,
        status: "PENDING"
      }
    })
  ]);

  console.log("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
