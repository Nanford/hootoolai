import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "邮箱地址为必填项" },
        { status: 400 }
      );
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // 即使找不到用户也返回成功，避免泄露用户信息
    if (!user) {
      return NextResponse.json(
        { message: "如果邮箱存在，重置链接将发送到该邮箱" },
        { status: 200 }
      );
    }

    // 生成重置令牌
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时后过期

    // 更新用户的重置令牌
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // 发送重置密码邮件
    await sendPasswordResetEmail(email, resetToken);

    return NextResponse.json(
      { message: "重置密码链接已发送到您的邮箱" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "发送重置密码邮件失败，请稍后再试" },
      { status: 500 }
    );
  }
} 