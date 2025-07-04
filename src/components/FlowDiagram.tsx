'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
  ConnectionMode,
  BackgroundVariant,
  useReactFlow,
  useNodesInitialized,
  Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Dispatch, SetStateAction } from 'react'
import { Tables } from '@/types/supabase'
import Dagre from '@dagrejs/dagre'

const getLayoutedElements = (nodes: Node[], edges: Edge[], options: { direction: string }) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: options.direction })

  edges.forEach(edge => g.setEdge(edge.source, edge.target))
  nodes.forEach(node =>
    g.setNode(node.id, {
      ...node,
      width: node.measured?.width ?? 0,
      height: node.measured?.height ?? 0,
    }),
  )

  Dagre.layout(g)

  return {
    nodes: nodes.map((node) => {
      const position = g.node(node.id)
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      const x = position.x - (node.measured?.width ?? 0) / 2
      const y = position.y - (node.measured?.height ?? 0) / 2

      return { ...node, position: { x, y } }
    }),
    edges,
  }
}

interface FlowDiagramProps {
  systems: Tables<'system'>[] | undefined
  interfaces: Tables<'interfaces_with'>[] | undefined
  onNodeAdd: () => void
  setActiveSystemId: Dispatch<SetStateAction<number | null>>
}

export default function FlowDiagram({ systems, onNodeAdd, setActiveSystemId, interfaces }: FlowDiagramProps) {
  // Use the hooks to manage nodes and edges
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[])
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[])
  const { fitView } = useReactFlow()
  const nodesInitialized = useNodesInitialized({})

  // Handle new connections between nodes
  const onConnect = async (params: Connection) => {
    await supabase.from('interfaces_with').insert({ first_system_id: parseInt(params.source), second_system_id: parseInt(params.target) })
    onNodeAdd()
  }

  // When edge(s) are deleted with backspace
  const deleteEdges = async (edges: Edge[]) => {
    for (const edgeIndex in edges) {
      const edge = edges[edgeIndex]
      await supabase.from('interfaces_with').delete().eq('first_system_id', parseInt(edge.source)).eq('second_system_id', parseInt(edge.target))
    }
    onNodeAdd()
  }

  // When node(s) are deleted with backspace
  const deleteNodes = async (ids: number[]) => {
    await supabase.from('system').delete().in('id', ids)
    onNodeAdd()
  }

  // Do auto-layout when nodes are initialized
  useEffect(() => {
    if (nodesInitialized) {
      const layouted = getLayoutedElements(nodes, edges, { direction: 'TB' })

      setNodes([...layouted.nodes])
      setEdges([...layouted.edges])

      fitView()
    }
  }, [nodesInitialized])

  // Format systems and interfaces into Node structure
  useEffect(() => {
    if (!systems) return

    const parentIds = systems.map(system => system.parent_system_id)
    const allIds = systems.map(system => system.id)

    const formattedNodes: Node[] = systems.map((system) => {
      const isGroupNode = system.parent_system_id === null || parentIds.includes(system.id)

      const formattedNode: Node = {
        id: system.id.toString(),
        data: { label: system.name },
        position: { x: 0, y: 0 },
      }

      if (isGroupNode) {
        formattedNode.style = system.parent_system_id === null || !allIds.includes(system.parent_system_id)
          ? { width: 450, height: 300, backgroundColor: '#DCDCDC' }
          : { width: 200, height: 150, backgroundColor: '#A9A9A9' }
      }

      if (system.parent_system_id !== null && allIds.includes(system.parent_system_id)) {
        formattedNode.parentId = system.parent_system_id.toString()
        formattedNode.extent = 'parent'
      }

      return formattedNode
    })

    setNodes(formattedNodes)

    if (interfaces) {
      const formattedInterfaces: Edge[] = interfaces.map((intr) => {
        return {
          id: `${intr.first_system_id}-${intr.second_system_id}`,
          source: intr.first_system_id.toString(),
          target: intr.second_system_id.toString(),
          zIndex: 999999,
          style: {
            stroke: '#696969',
            strokeWidth: 2,
          },
        }
      })

      setEdges(formattedInterfaces)
    }
  }, [systems, interfaces, setNodes])

  return (
    <Card className="size-full relative py-0">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        connectionMode={ConnectionMode.Loose}
        fitView
        onNodeDoubleClick={(event, node) => {
          setActiveSystemId(parseInt(node.id))
        }}
        onNodesDelete={async (nodes) => {
          await deleteNodes(nodes.map(node => parseInt(node.id)))
        }}
        onEdgesDelete={deleteEdges}
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Panel position="top-right">
          <Button variant="outline" onClick={() => setActiveSystemId(null)}>Clear active system</Button>
        </Panel>
      </ReactFlow>
    </Card>
  )
}
