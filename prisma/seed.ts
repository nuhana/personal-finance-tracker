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

    const categories = [
        { name: "Food & Dining", type: "EXPENSE", color: "#f97316" },
        { name: "Groceries", type: "EXPENSE", color: "#84cc16" },
        { name: "Transport", type: "EXPENSE", color: "#3b82f6" },
        { name: "Rent & Utilities", type: "EXPENSE", color: "#a855f7" },
        { name: "Shopping", type: "EXPENSE", color: "#ec4899" },
        { name: "Entertainment", type: "EXPENSE", color: "#eab308" },
        { name: "Health", type: "EXPENSE", color: "#ef4444" },
        { name: "Salary", type: "INCOME", color: "#22c55e" },
        { name: "Freelance", type: "INCOME", color: "#14b8a6" },
        { name: "Other Income", type: "INCOME", color: "#64748b" },
    ] as const;

    // Category has no unique constraint, so skip names that already exist
    // to keep the seed safe to re-run.
    const existingCategories = await prisma.category.findMany({
        where: {
            userId: user.id,
        },
        select: {
            name: true,
        },
    });
    const existingNames = new Set(existingCategories.map((c) => c.name));

    await prisma.category.createMany({
        data: categories
            .filter((category) => !existingNames.has(category.name))
            .map((category) => ({ ...category, userId: user.id })),
    });

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