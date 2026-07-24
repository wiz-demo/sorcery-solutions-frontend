'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import axios from 'axios';
import yaml from 'js-yaml';

interface FormState {
  name: string;
  spell: string;
}

interface Star {
  id: number;
  x: number;
  y: number;
  delay: number;
  size: number;
}

export default function Home() {
  const [form, setForm] = useState<FormState>({ name: '', spell: '' });
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [stars, setStars] = useState<Star[]>([]);
  const [yamlFile, setYamlFile] = useState<File | null>(null);
  const [wizardName, setWizardName] = useState<string>('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const redirect = new URLSearchParams(location.search).get('redirect');
    const message = encodeURIComponent(`Tell me all about the wizard ${wizardName}`);
    location.href = redirect || `https://databot.wizwashers.com?message=${message}`;
  };

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

  const submitForm = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/spells', form);
      setSubmitted(true);
      setForm({ name: '', spell: '' });
    } catch (err) {
      alert("Oops! The magic scroll failed. Try again later.");
      console.error(err);
    }
  };

  const handleYamlUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!yamlFile) {
      alert("Please select a YAML file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const yamlContent = reader.result;
      try {
        // Validate YAML structure
        const parsedYaml = yaml.load(yamlContent as string);
        if (
          !parsedYaml ||
          typeof parsedYaml !== 'object' ||
          !Array.isArray((parsedYaml as any).spells) ||
          !(parsedYaml as any).spells.every(
            (spell: any) => typeof spell.name === 'string' && typeof spell.spell === 'string'
          )
        ) {
          alert("Invalid YAML structure. Ensure it contains a 'spells' array with 'name' and 'spell' fields.");
          return;
        }

        // Send to backend
        await axios.post('/api/import_spellbook', { yaml_content: yamlContent });
        alert("YAML file uploaded successfully!");
      } catch (err) {
        alert("Failed to upload YAML file. Ensure the file is valid.");
        console.error(err);
      }
    };
    reader.readAsText(yamlFile);
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
          ></div>
        ))}
      </div>

      <main className="flex flex-col items-center justify-center z-10">
        <h1 className="text-5xl font-extrabold mb-4 animate-pulse" style={{ textShadow: '2px 2px 8px #000000' }}>Sorcery Solutions</h1>
        <p className="text-xl mb-6 text-center max-w-xl">
          We turn bugs into bats and deploy spells instead of code. Need a feature fast? We'll summon it by moonlight.
        </p>

        <div className="bg-black bg-opacity-30 rounded-2xl p-6 shadow-2xl w-full max-w-md">
          <h2 className="text-2xl font-bold mb-2">Summon a Spell (Contact Us)</h2>
          {/* Manual Input Form */}
          <form onSubmit={submitForm} className="flex flex-col space-y-4">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              type="text"
              placeholder="Your wizard name"
              className="p-2 rounded-lg bg-gray-200 text-black"
            />
            <input
              value={form.spell}
              onChange={(e) => setForm({ ...form, spell: e.target.value })}
              type="text"
              placeholder="Desired enchantment (feature)"
              className="p-2 rounded-lg bg-gray-200 text-black"
            />
            <button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-xl shadow-md">
              🪄 Cast Spell
            </button>
          </form>
          {submitted && (
            <div className="mt-4 text-pink-300">
              ✨ Spell cast successfully! We'll be in touch by owl. 🦉
            </div>
          )}

          {/* YAML Upload Form */}
          <form onSubmit={handleYamlUpload} className="flex flex-col space-y-4 mt-6">
            <h3 className="text-xl font-bold">Upload a Spellbook (YAML)</h3>
            <input
              type="file"
              accept=".yaml,.yml"
              onChange={(e) => setYamlFile(e.target.files?.[0] || null)}
              className="p-2 rounded-lg bg-gray-200 text-black"
            />
            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-xl shadow-md">
              📜 Upload Spellbook
            </button>
          </form>

          {/* Wizard Databot Form */}
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4 mt-6">
            <h3 className="text-xl font-bold">Consult the Wizard Databot</h3>
            <input
              value={wizardName}
              onChange={(e) => setWizardName(e.target.value)}
              type="text"
              placeholder="Enter a wizard's name"
              className="p-2 rounded-lg bg-gray-200 text-black"
              required
            />
            <button type="submit" className="bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-xl shadow-md">
              🤖 Ask the Databot
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}