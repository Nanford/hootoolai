import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();

    // 验证请求数据
    if (!email || !password) {
      return NextResponse.json(
        { message: "邮箱和密码为必填项" },
        { status: 400 }
      );
    }

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "该邮箱已被注册" },
        { status: 400 }
      );
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 生成验证令牌
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split("@")[0],
        verificationToken,
      },
    });

    // 发送验证邮件
    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json(
      { message: "注册成功，请查看邮箱验证链接" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "注册失败，请稍后再试" },
      { status: 500 }
    );
  }
} 