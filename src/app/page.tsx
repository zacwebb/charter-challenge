'use client'

import { supabase } from '@/lib/supabase'
import { Tables } from '@/types/supabase'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import SystemDetails from '@/components/SystemDetails'
import { ReactFlowProvider } from '@xyflow/react'
import InterfaceDetails from '@/components/InterfaceDetails'

// Use dynamic import for the FlowDiagram component
const FlowDiagram = dynamic(
  () => import('@/components/FlowDiagram'),
  { ssr: false },
)

export default function Home() {
  const [systems, setSystems] = useState<Tables<'system'>[]>()
  const [interfaces, setInterfaces] = useState<Tables<'interfaces_with'>[]>()
  const [activeSystem, setActiveSystem] = useState<number | null>(null)

  async function fetchData() {
    const { data: systemData, error: systemError } = await supabase.from('system').select('*')

    if (systemError) {
      return console.error('Error fetching system data:', systemError)
    }

    let systemsToSet: Tables<'system'>[] = []

    if (activeSystem) {
      // Fetch the active system and its descendants
      const activeSystemData = systemData.find(system => system.id === activeSystem)

      if (activeSystemData) {
        const descendants = getDescendants(systemData, activeSystem, 2)
        systemsToSet = [activeSystemData, ...descendants]
      }

      setSystems(systemsToSet)
    }
    else {
      // Fetch only top-level systems (parent_system_id is null)
      systemsToSet = systemData.filter(system => system.parent_system_id === null)
      setSystems(systemsToSet)
    }

    const allSystemIds = systemsToSet.map(sys => sys.id).toString()

    if (allSystemIds) {
      // Only fetch interfaces for the currently visible systems
      const { data: interfaceData, error: interfaceError } = await supabase.from('interfaces_with').select('*').or(`first_system_id.in.(${allSystemIds}), second_system_id.in.(${allSystemIds})`)

      if (interfaceError) {
        return console.error('Error fetching interface data:', interfaceError)
      }

      setInterfaces(interfaceData)
    }
  }

  // Helper function to get all descendants of a system
  function getDescendants(systems: Tables<'system'>[], parentId: number, depth: number = 2): Tables<'system'>[] {
    const descendants: Tables<'system'>[] = []
    if (depth === 0) {
      return descendants
    }
    const children = systems.filter(system => system.parent_system_id === parentId)

    children.forEach((child) => {
      descendants.push(child, ...getDescendants(systems, child.id, depth - 1))
    })

    return descendants
  }

  useEffect(() => {
    fetchData()
  }, [activeSystem])

  // Find the active system object
  const system = systems?.find(s => s.id === activeSystem) || null

  const childSystems = systems?.filter(s => s.id !== activeSystem) || []

  return (
    <div className="container h-screen mx-auto py-8 px-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Next.js + Supabase + React Flow</h1>
      <div className="grid grid-cols-1 grid-rows-4 lg:grid-cols-3 lg:grid-rows-2 gap-6 size-full min-h-[800px]">
        <div className="lg:col-span-2 row-span-2">
          <ReactFlowProvider>
            <FlowDiagram
              systems={systems}
              interfaces={interfaces}
              onNodeAdd={fetchData}
              setActiveSystemId={setActiveSystem}
            />
          </ReactFlowProvider>
        </div>
        <div className="row-span-1">
          <SystemDetails system={system} onUpdate={fetchData} childSystems={childSystems} setActiveSystemId={setActiveSystem} />
        </div>

        <div className="row-span-1">
          <InterfaceDetails onUpdate={fetchData} interfaces={interfaces || []} systems={systems || []} />
        </div>
      </div>
    </div>
  )
}
