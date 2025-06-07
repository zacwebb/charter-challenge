'use client';

import { supabase } from "@/lib/supabase";
import { Tables } from "@/types/supabase";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Use dynamic import for the FlowDiagram component
const FlowDiagram = dynamic(
  () => import('@/components/FlowDiagram'),
  { ssr: false }
);

export default function Home() {
  const [systems, setSystems] = useState<Tables<'system'>[]>();
  const [activeSystem, setActiveSystem] = useState<number | null>(null);

  async function fetchData() {
    const { data, error } = await supabase.from("system").select();
    if (error) {
      return console.error("Error fetching data:", error);
    }

    setSystems(data);
  }
    
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-4">
    <div>{JSON.stringify(systems, null, 2)}</div>

      <h1 className="text-2xl font-bold mb-4">Next.js + Supabase + React Flow</h1>
      <div className="border rounded-lg overflow-hidden">
        <FlowDiagram
          systems={systems}
          onNodeAdd={fetchData}
          setActiveSystemId={setActiveSystem}
        />
      </div>
      <div>Active System: {activeSystem}</div>
    </div>
  );
}
