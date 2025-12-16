"use client";
import { useBranchStore } from "@/store/useBranchStore";
import { useEffect } from "react";

export default function AboutPage() {
  const { branches, fetchBranches } = useBranchStore();

  useEffect(() => { fetchBranches(); }, []);

  return (
    <main className="min-h-screen pt-24 pb-12 px-6 bg-crack-cream text-crack-black">
       <div className="max-w-4xl mx-auto space-y-16">
          
          <div className="text-center space-y-6">
             <h1 className="font-serif text-5xl md:text-7xl">Our Story</h1>
             <p className="text-xl opacity-70 leading-relaxed max-w-2xl mx-auto">
                Crack & Go started with a simple idea: Traditional Crack tea, modernized for the fast-paced, aesthetic-driven world of Nairobi.
             </p>
          </div>

          <div className="grid gap-8">
             <h2 className="font-marker text-3xl text-center text-crack-orange">Our Locations</h2>
             <div className="grid md:grid-cols-2 gap-6">
                {branches.map(branch => (
                    <div key={branch.id} className="bg-white p-8 rounded-3xl border border-crack-black/5 hover:shadow-lg transition-shadow">
                        <h3 className="font-serif text-2xl mb-2">{branch.name}</h3>
                        <p className="text-sm opacity-60 mb-4">{branch.is_open ? "Currently Open" : "Currently Closed"}</p>
                        <p className="text-base">Your local spot for vibes and chai.</p>
                    </div>
                ))}
             </div>
          </div>

       </div>
    </main>
  );
}