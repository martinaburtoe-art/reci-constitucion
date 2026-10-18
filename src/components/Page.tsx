import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
export function Page({title,children,action}:{title:string;children:ReactNode;action?:ReactNode}) { return <main className="mx-auto max-w-lg space-y-5 px-4 pt-5 pb-28"><header className="flex items-center justify-between gap-3"><div><Link to="/" className="text-sm font-bold text-primary">ReciConti</Link><h1 className="font-display text-3xl font-bold">{title}</h1></div>{action}</header>{children}<BottomNav/></main>; }
