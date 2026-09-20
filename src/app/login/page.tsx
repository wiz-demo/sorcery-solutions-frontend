'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';

interface Star {
  id: number;
  x: number;
  y: number;
  delay: number;
  size: number;
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const starArray: Star[] = Array.from({ length: 30 }, (_, n) => ({
      id: n,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      size: Math.random() * 2 + 1,
    }));
    setStars(starArray);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your wizard credentials.');
      return;
    }
    const redirect = new URLSearchParams(location.search).get('redirect');
    location.href = redirect || '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-600 to-blue-800 text-white p-6 relative overflow-hidden">
      <nav className="z-20 flex justify-between items-center max-w-5xl mx-auto py-4 px-6 bg-black bg-opacity-30 rounded-xl mb-8 shadow-xl">
        <Link href="/" className="text-2xl font-bold hover:text-pink-300">🔮 Sorcery Solutions</Link>
        <div className="space-x-4">
          <Link href="/" className="hover:underline hover:text-pink-200">Home</Link>
          <Link href="/spellbook" className="hover:underline hover:text-pink-200">Spellbook</Link>
        </div>
      </nav>

      <div className="absolute inset-0 z-0 pointer-events-none">
        {stars.map((star) => (
          <div
            key={star.id}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              animationDelay: `${star.delay}s`,
              width: `${star.size}px`,
              height: `${star.size}px`,
            }}
            className="absolute bg-white rounded-full animate-pulse"
          />
        ))}
      </div>

      <main className="flex flex-col items-center justify-center z-10 mt-12">
        <h1 className="text-4xl font-extrabold mb-2" style={{ textShadow: '2px 2px 8px #000000' }}>
          🧙 Wizard Login
        </h1>
        <p className="text-lg mb-8 text-center max-w-sm">
          Enter the arcane portal. Only true wizards may pass.
        </p>

        <div className="bg-black bg-opacity-30 rounded-2xl p-8 shadow-2xl w-full max-w-sm">
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-1">
              <label className="text-sm text-pink-200">Wizard Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="wizard@sorcery.io"
                className="p-2 rounded-lg bg-gray-200 text-black"
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-sm text-pink-200">Magic Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="p-2 rounded-lg bg-gray-200 text-black"
              />
            </div>
            {error && <p className="text-red-300 text-sm">{error}</p>}
            <button
              type="submit"
              className="bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-xl shadow-md font-bold"
            >
              🪄 Enter the Portal
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-300">
            Not a wizard yet?{' '}
            <Link href="/register" className="text-pink-300 hover:underline">
              Join the coven
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
