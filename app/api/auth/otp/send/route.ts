import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requestOtp } from "@/lib/otp";

const schema = z.object({
  email: z.string().email("Địa chỉ email không hợp lệ."),
  type: z.enum(["REGISTER", "RESET_PASSWORD"]),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Dữ liệu yêu cầu không hợp lệ." },
      { status: 400 }
    );
  }

  const { email, type } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (type === "REGISTER" && user) {
    return NextResponse.json(
      { error: "Email này đã được đăng ký tài khoản. Vui lòng đăng nhập hoặc dùng email khác." },
      { status: 409 }
    );
  }

  if (type === "RESET_PASSWORD" && !user) {
    return NextResponse.json(
      { error: "Email này chưa được đăng ký tài khoản trong hệ thống." },
      { status: 404 }
    );
  }

  const result = await requestOtp(normalizedEmail, type);
  if (!result.success) {
    return NextResponse.json({ error: result.error || "Không thể gửi mã OTP." }, { status: 429 });
  }

  return NextResponse.json({
    success: true,
    message: "Mã xác thực OTP đã được gửi đến email của bạn.",
    // devCode only exposed in test environment (NODE_ENV=test), never in development or production
    ...(process.env.NODE_ENV === "test" && result.devCode ? { devCode: result.devCode } : {}),
  });
}
