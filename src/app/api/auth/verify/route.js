import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { message: "验证令牌无效" },
        { status: 400 }
      );
    }

    // 查找具有该验证令牌的用户
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "验证令牌无效或已过期" },
        { status: 400 }
      );
    }

    // 更新用户的验证状态
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
      },
    });

    return NextResponse.json(
      { message: "邮箱验证成功" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { message: "验证失败，请稍后再试" },
      { status: 500 }
    );
  }
} 