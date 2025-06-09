import { Tables } from '@/types/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { MoveRight } from 'lucide-react'
import EditButton from './EditButton'
import TrashButton from './TrashButton'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import {
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogContent,
} from '@/components/ui/dialog'
import { Label } from './ui/label'

interface InterfaceDetailsProps {
  interfaces: Tables<'interfaces_with'>[]
  systems: Tables<'system'>[]
  onUpdate: () => void
}

const InterfaceDetails = ({ interfaces, systems, onUpdate }: InterfaceDetailsProps) => {
  const [open, setOpen] = useState(false)
  const [dialogConnectionType, setDialogConnectionType] = useState('')
  const [dialogDirectional, setDialogDirectional] = useState(0)
  const [interfaceEditId, setInterfaceEditId] = useState<{ firstId: number, secondId: number } | null>(null)

  const deleteInterface = async (firstId: number, secondId: number) => {
    await supabase.from('interfaces_with').delete().eq('first_system_id', firstId).eq('second_system_id', secondId)
    onUpdate()
  }

  const openInterfaceEditDialog = (iface: Tables<'interfaces_with'>) => {
    setDialogConnectionType(iface.connection_type ?? '')
    setDialogDirectional(iface.directional ?? 0)
    setInterfaceEditId({ firstId: iface.first_system_id, secondId: iface.second_system_id })
    setOpen(true)
  }

  useEffect(() => {
    if (!open) {
      // Clear the dialog values when closing
      setDialogConnectionType('')
      setDialogDirectional(0)
      setInterfaceEditId(null)
    }
  }, [open])

  const editInterface = async (firstId: number, secondId: number, directional: number, connectionType: string) => {
    await supabase.from('interfaces_with').update({ directional, connection_type: connectionType }).eq('first_system_id', firstId).eq('second_system_id', secondId)
    setOpen(false)
    onUpdate()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={() => setOpen(!open)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Interface</DialogTitle>
            <DialogDescription>
              Edit the details of the interface
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Directional
              </Label>
              <Input id="name" type="number" value={dialogDirectional} className="col-span-3" onChange={e => setDialogDirectional(parseInt(e.target.value))} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Connection Type
              </Label>
              <Input id="category" value={dialogConnectionType} className="col-span-3" onChange={e => setDialogConnectionType(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={() => interfaceEditId?.firstId && editInterface(interfaceEditId?.firstId, interfaceEditId?.secondId, dialogDirectional, dialogConnectionType)}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Card className="h-full overflow-scroll">
        <CardHeader>
          <CardTitle>Interfaces</CardTitle>
          <CardDescription>All interfaces of current and sub-systems</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          { interfaces.length === 0 && <p className="text-gray-500">No interfaces in selected system</p>}
          {interfaces.map(iface => (
            <div key={`${iface.first_system_id}-${iface.second_system_id}`} className="flex flex-col group">
              <div className="flex flex-row items-center gap-2 h-8">
                <div className="flex flex-row items-center gap-2">
                  {systems.find(sys => sys.id === iface.first_system_id)?.name}
                  <MoveRight className="size-4 text-gray-300" />
                  {systems.find(sys => sys.id === iface.second_system_id)?.name}
                </div>

                <div className="hidden group-hover:block">
                  <EditButton onClick={() => openInterfaceEditDialog(iface)} />
                  <TrashButton onClick={() => deleteInterface(iface.first_system_id, iface.second_system_id)} />
                </div>
              </div>

              <div className="flex flex-row gap-6">
                <div>
                  <div className="text-xs text-gray-400">Directional</div>
                  <div className="text-sm text-gray-500">{iface.directional ?? 'None'}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-400">Connection Type</div>
                  <div className="text-sm text-gray-500">{iface.connection_type ?? 'None'}</div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  )
}

export default InterfaceDetails
