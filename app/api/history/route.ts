import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // We need to export authOptions from somewhere

const prisma = new PrismaClient();

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const history = await prisma.history.findMany({
        where: {
            user: {
                email: session.user.email,
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 20,
    });

    return NextResponse.json(history);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt, result, model } = await req.json();

    const user = await prisma.user.upsert({
        where: { email: session.user.email },
        update: {},
        create: {
            email: session.user.email,
            name: session.user.name,
            image: session.user.image,
        },
    });

    const entry = await prisma.history.create({
        data: {
            prompt,
            result,
            model: model || "llama3.2:3b",
            userId: user.id,
        },
    });

    return NextResponse.json(entry);
}
