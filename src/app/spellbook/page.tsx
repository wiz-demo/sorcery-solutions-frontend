'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface Spell {
  id: string;
  name: string;
  spell: string;
}

export default function SpellbookPage() {
  const [spells, setSpells] = useState<Spell[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpells = async () => {
      try {
        const res = await axios.get('/api/spells');
        setSpells(res.data);
      } catch (error) {
        console.error('Failed to fetch spells:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpells();
  }, []);

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

      <h1 className="text-4xl font-bold text-center mb-6">📜 The Spellbook</h1>
      {loading ? (
        <p className="text-center text-lg">Summoning spell list...</p>
      ) : (
        <div className="max-w-2xl mx-auto space-y-4">
          {spells.map((spell) => (
            <div key={spell.id} className="bg-black bg-opacity-30 p-4 rounded-xl shadow-xl">
              <h2 className="text-2xl font-semibold">🧙 {spell.name}</h2>
              <p className="text-pink-200">{spell.spell}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
