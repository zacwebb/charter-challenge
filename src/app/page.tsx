'use client';

import { supabase } from "@/lib/supabase";
import { Tables } from "@/types/supabase";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import SystemDetails from "@/components/SystemDetails"; // Import the SystemDetails component
import { Button } from "@/components/ui/button";
import { ReactFlowProvider } from '@xyflow/react';

// Use dynamic import for the FlowDiagram component
const FlowDiagram = dynamic(
  () => import('@/components/FlowDiagram'),
  { ssr: false }
);

export default function Home() {
  const [systems, setSystems] = useState<Tables<'system'>[]>();
  const [activeSystem, setActiveSystem] = useState<number | null>(null);

  async function fetchData() {
    const { data, error } = await supabase.from("system").select("*");

    if (error) {
      return console.error("Error fetching data:", error);
    }

    if (activeSystem) {
      // Fetch the active system and its descendants
      const activeSystemData = data.find((system) => system.id === activeSystem);
      let systemsToSet: Tables<'system'>[] = [];

      if (activeSystemData) {
        const descendants = getDescendants(data, activeSystem);
        systemsToSet = [activeSystemData, ...descendants];
      }

      setSystems(systemsToSet);
    } else {
      // Fetch only top-level systems (parent_system_id is null)
      const topLevelSystems = data.filter((system) => system.parent_system_id === null);
      setSystems(topLevelSystems);
    }
  }

  // Helper function to get all descendants of a system
  function getDescendants(systems: Tables<'system'>[], parentId: number): Tables<'system'>[] {
    const descendants: Tables<'system'>[] = [];
    const children = systems.filter((system) => system.parent_system_id === parentId);

    children.forEach((child) => {
      descendants.push(child, ...getDescendants(systems, child.id));
    });

    return descendants;
  }
    
  useEffect(() => {
    fetchData();
  }, [activeSystem]);

  // Find the active system object
  const system = systems?.find((s) => s.id === activeSystem) || null;

  const childSystems = systems?.filter((s) => s.id !== activeSystem) || [];

  return (
    <div className="container mx-auto p-4">
      <div>{JSON.stringify(systems, null, 2)}</div>
      <Button onClick={() => setActiveSystem(null)}>Clear active system</Button>
      <h1 className="text-2xl font-bold mb-4">Next.js + Supabase + React Flow</h1>
      <div className="grid grid-cols-3 gap-10">
        <div className="col-span-2">
          <ReactFlowProvider>
            <FlowDiagram
              systems={systems}
              onNodeAdd={fetchData}
              setActiveSystemId={setActiveSystem}
            />
          </ReactFlowProvider>
        </div>
        <div>
          <SystemDetails system={system} onUpdate={fetchData} childSystems={childSystems} setActiveSystemId={setActiveSystem} />
        </div>
      </div>
    </div>
  );
}
