import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const userId = "cmi5zz74k00007q4skczcm7ad";

    const user = await prisma.user.upsert({
        where: {
            id: userId,
        },
        update: {},
        create: {
            id: userId,
            email: "demo@finance-tracker.com",
            name: "Demo User",
        },
    });

    const existingAccount = await prisma.account.findFirst({
        where: {
            userId: user.id,
        },
    });

    if (!existingAccount) {
        await prisma.account.create({
            data: {
                userId: user.id,
                name: "Main Wallet",
                type: "BANK",
                balance: 0,
            },
        });
    }

    console.log("Database seeded successfully");
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });