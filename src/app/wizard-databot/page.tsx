'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';

export default function WizardDatabotPage() {
  const [wizardName, setWizardName] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const redirect = new URLSearchParams(location.search).get('redirect');
    const message = encodeURIComponent(`Tell me all about the wizard ${wizardName}`);
    location.href = redirect || `https://databot.wizwashers.com?message=${message}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-600 to-blue-800 text-white p-6">
      <nav className="z-20 flex justify-between items-center max-w-5xl mx-auto py-4 px-6 bg-black bg-opacity-30 rounded-xl mb-8 shadow-xl">
        <Link href="/" className="text-2xl font-bold hover:text-pink-300">🔮 Sorcery Solutions</Link>
        <div className="space-x-4">
          <Link href="/" className="hover:underline hover:text-pink-200">Home</Link>
          <Link href="/spellbook" className="hover:underline hover:text-pink-200">Spellbook</Link>
          <Link href="/wizard-databot" className="hover:underline hover:text-pink-200">Wizard Databot</Link>
        </div>
      </nav>

      <div className="max-w-xl mx-auto mt-16">
        <h1 className="text-4xl font-bold text-center mb-4">🧙 Wizard Databot</h1>
        <p className="text-center text-pink-200 mb-10">Enter a wizard&apos;s name to learn all about them.</p>

        <form onSubmit={handleSubmit} className="bg-black bg-opacity-30 p-8 rounded-xl shadow-xl space-y-6">
          <div>
            <label htmlFor="wizardName" className="block text-sm font-medium mb-2">
              Wizard Name
            </label>
            <input
              id="wizardName"
              type="text"
              value={wizardName}
              onChange={(e) => setWizardName(e.target.value)}
              placeholder="e.g. Merlin"
              required
              className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-pink-500 hover:bg-pink-400 rounded-lg font-semibold transition-colors"
          >
            Ask the Databot ✨
          </button>
        </form>
      </div>
    </div>
  );
}
