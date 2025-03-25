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
    <div className="flex h-full flex-col bg-white shadow-sm border-r">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <SparklesIcon className="h-6 w-6 text-blue-500" />
          <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            HooTool AI
          </span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-blue-500 ${
                item.active 
                  ? 'bg-blue-50 text-blue-600 font-medium' 
                  : 'text-gray-500 hover:bg-blue-50'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
      {session ? (
        <div className="mt-auto p-4 border-t">
          <div className="flex items-center gap-3 py-2">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                {session.user?.image ? (
                  <img 
                    src={session.user.image} 
                    alt={session.user.name || '用户'} 
                    className="h-8 w-8 rounded-full" 
                  />
                ) : (
                  <UserCircleIcon className="h-6 w-6 text-blue-500" />
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{session.user?.name || session.user?.email}</p>
            </div>
            <button 
              onClick={() => signOut()} 
              className="rounded p-1 hover:bg-gray-100"
              aria-label="登出"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
} 