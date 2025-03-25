import nodemailer from 'nodemailer';

// 创建邮件发送器
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: process.env.EMAIL_SERVER_PORT,
    secure: process.env.EMAIL_SERVER_PORT === '465',
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
};

// 发送验证邮件
export async function sendVerificationEmail(email, token) {
  const transporter = createTransporter();
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify?token=${token}`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '请验证您的 HooTool AI 账户',
      text: `欢迎使用 HooTool AI！请点击下面的链接验证您的邮箱：${verificationUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4F46E5; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">HooTool AI</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
            <h2>验证您的邮箱地址</h2>
            <p>感谢您注册 HooTool AI！请点击下面的按钮验证您的邮箱地址：</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">验证邮箱</a>
            </div>
            <p>或者，您可以复制并粘贴以下链接到浏览器地址栏：</p>
            <p style="word-break: break-all; color: #4F46E5;">${verificationUrl}</p>
            <p>如果您没有注册 HooTool AI 账户，请忽略此邮件。</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;" />
            <p style="color: #6b7280; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} HooTool AI. 保留所有权利。</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error('Send verification email error:', error);
    throw error;
  }
}

// 发送密码重置邮件
export async function sendPasswordResetEmail(email, token) {
  const transporter = createTransporter();
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '重置您的 HooTool AI 密码',
      text: `您请求了密码重置。请点击下面的链接重置密码：${resetUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4F46E5; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">HooTool AI</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
            <h2>重置您的密码</h2>
            <p>您收到此邮件是因为您请求了重置密码。请点击下面的按钮设置新密码：</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">重置密码</a>
            </div>
            <p>或者，您可以复制并粘贴以下链接到浏览器地址栏：</p>
            <p style="word-break: break-all; color: #4F46E5;">${resetUrl}</p>
            <p>如果您没有请求重置密码，请忽略此邮件，您的密码不会被更改。</p>
            <p>此链接将在24小时后过期。</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;" />
            <p style="color: #6b7280; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} HooTool AI. 保留所有权利。</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error('Send password reset email error:', error);
    throw error;
  }
}