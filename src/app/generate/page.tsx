"use client";

import { AIGenerationTest } from "@/components/AIGenerationTest";

export default function GeneratePage() {
  return (
    <div className="generate-page">
      <AIGenerationTest />

      <style jsx>{`
        .generate-page {
          min-height: 100vh;
          background: #f5f5f5;
          padding: 2rem 1rem;
        }
      `}</style>
    </div>
  );
}
