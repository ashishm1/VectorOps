
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('hackathonuser@gmail.com');
  const [password, setPassword] = useState('password');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      login({ email }, () => router.push('/'));
    }, 1000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
        <div className="hidden lg:flex flex-col gap-8 text-left">
           <div className="flex items-center gap-2">
             <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M17 14h.01"/><path d="M7 10h.01"/><path d="M15.5 20H8.6c-2.8 0-5.1-2.4-5.1-5.4A5.6 5.6 0 0 1 8.4 4c.5-2.3 2.5-4 5.1-4 2.8 0 5.1 2.2 5.1 5a5.5 5.5 0 0 1-1.5 3.8"/><path d="M18.8 14.5A3.4 3.4 0 0 1 22 17.9c0 1.9-1.5 3.4-3.4 3.4-1.2 0-2.3-.6-2.9-1.5"/><path d="m14 14-1.2 1.2"/></svg>
             </div>
             <h1 className="text-2xl font-bold">Project Raseed</h1>
           </div>
          <div>
            <h2 className="text-5xl font-bold tracking-tighter leading-tight">Your AI-Powered</h2>
            <h2 className="text-5xl font-bold tracking-tighter leading-tight text-primary/80">Expense Whisperer</h2>
            <p className="text-muted-foreground mt-4 max-w-md">
              Automatically track spending, manage budgets, and get smart financial insights with a simple snap of your receipt.
            </p>
          </div>
          <Image
            src="/images/scanning-receipt.png"
            alt="Scanning Receipt with Financial Insights"
            width={600}
            height={400}
            className="rounded-lg shadow-2xl"
            priority
          />
        </div>
        
        <Card className="w-full max-w-sm shadow-2xl bg-secondary/30 border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-sm text-center block">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/signup" className="font-semibold text-primary hover:underline">
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
