import { PrismaAdapter } from '@auth/prisma-adapter';
import { compare } from 'bcryptjs';
import prisma from './prisma';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: '邮箱', type: 'email' },
        password: { label: '密码', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('请提供邮箱和密码');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('用户不存在');
        }

        if (!user.emailVerified) {
          throw new Error('请先验证您的邮箱地址');
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('密码不正确');
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          isPremium: user.isPremium,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
        token.isPremium = user.isPremium;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.isAdmin = token.isAdmin;
        session.user.isPremium = token.isPremium;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    newUser: '/register',
    error: '/login'
  },
  debug: process.env.NODE_ENV === 'development',
}; 