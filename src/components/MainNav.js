'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { 
  HomeIcon, 
  PhotoIcon, 
  SparklesIcon, 
  UserCircleIcon, 
  Cog6ToothIcon, 
  ArrowLeftOnRectangleIcon 
} from '@heroicons/react/24/outline';

export function MainNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (path) => {
    return pathname === path;
  };

  const navItems = [
    {
      name: '首页',
      href: '/',
      icon: HomeIcon,
      active: pathname === '/',
    },
    {
      name: '图片处理',
      href: '/tools/image-processing',
      icon: PhotoIcon,
      active: pathname.startsWith('/tools/image-processing'),
    },
    {
      name: '艺术卡片',
      href: '/tools/art-generation',
      icon: SparklesIcon,
      active: pathname.startsWith('/tools/art-generation'),
    },
    {
      name: '个人中心',
      href: '/dashboard/profile',
      icon: UserCircleIcon,
      active: pathname.startsWith('/dashboard/profile'),
    },
    {
      name: '设置',
      href: '/dashboard/settings',
      icon: Cog6ToothIcon,
      active: pathname.startsWith('/dashboard/settings'),
    },
  ];

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-blue-600 to-purple-700 text-white">
      <div className="flex h-16 items-center px-4 border-b border-white border-opacity-20">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <SparklesIcon className="h-6 w-6 text-white" />
          <span className="text-xl font-bold text-white">
            HOOTOOL AI
          </span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start px-2 gap-1">
          {navItems.map((item) => {
            return item.active ? (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 bg-white text-blue-600 font-medium transition-all"
              >
                <item.icon className="h-5 w-5 text-blue-600" />
                <span>{item.name}</span>
              </Link>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-white hover:bg-white hover:text-blue-600 transition-all"
              >
                <item.icon className="h-5 w-5 text-white" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      {session ? (
        <div className="mt-auto p-4 border-t border-white border-opacity-20">
          <div className="flex items-center gap-3 py-2">
            <div className="flex-shrink-0">
              <div className="h-9 w-9 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                {session.user?.image ? (
                  <img 
                    src={session.user.image} 
                    alt={session.user.name || '用户'} 
                    className="h-8 w-8 rounded-full" 
                  />
                ) : (
                  <UserCircleIcon className="h-6 w-6 text-white" />
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-white">{session.user?.name || session.user?.email}</p>
            </div>
            <button 
              onClick={() => signOut()} 
              className="rounded p-1.5 bg-blue-500 hover:bg-white hover:text-blue-600 transition group"
              aria-label="登出"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5 text-white group-hover:text-blue-600" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
} 