import { Tables } from "@/types/supabase";
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogContent,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { CornerDownRight, Edit, PlusSquare, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator"
import clsx from 'clsx';

const TrashButton = ({ onClick }: { onClick: () => void }) => {
  return <Button onClick={onClick} size="sm" variant="ghost" className="text-red-800 hover:bg-red-50 hover:text-red-800"><Trash2 /></Button>
}

const EditButton = ({ onClick }: { onClick: () => void }) => {
  return <Button size="sm" variant="ghost" onClick={onClick}><Edit /></Button>
}

interface SystemFormDialogProps {
  open: boolean,
  onOpenChange: () => void,
  name: string,
  category: string,
  onNameChange: (name: string) => void,
  onCategoryChange: (category: string) => void,
  onSubmit: () => void,
  mode: 'create' | 'edit'
}

const SystemFormDialog = ({ open, onOpenChange, name, category, onCategoryChange, onNameChange, onSubmit, mode }: SystemFormDialogProps) => {
  const isCreate = mode === 'create';

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{isCreate ? 'Add' : 'Edit'} System</DialogTitle>
        <DialogDescription>
          { isCreate ? 'Add a new system' : 'Edit this system'}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Name
          </Label>
          <Input id="name" value={name} className="col-span-3" onChange={(e) => onNameChange(e.target.value)} />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="category" className="text-right">
            Category
          </Label>
          <Input id="category" value={category} className="col-span-3" onChange={(e) => onCategoryChange(e.target.value)} />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" onClick={onSubmit}>{ isCreate ? 'Create' : 'Submit' }</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
}

interface SystemDetailsProps {
  system: Tables<'system'> | null;
  onUpdate: () => void;
  childSystems: Tables<'system'>[];
  setActiveSystemId: (id: number | null) => void;
}

const SystemDetails = ({ system, onUpdate, childSystems, setActiveSystemId }: SystemDetailsProps) => {
  const [open, setOpen] = useState(false);
  const [dialogName, setDialogName] = useState('');
  const [dialogCategory, setDialogCategory] = useState('');
  const [systemEditId, setSystemEditId] = useState<number | null>(null);

  const deleteSystem = async () => {
    if (!system) return;

    await supabase.from('system').delete().eq('id', system.id);

    onUpdate();
  }

  const deleteChildSystem = async (childId: number) => {
    await supabase.from('system').delete().eq('id', childId);
    onUpdate();
  }

  useEffect(() => {
    if (!open) {
      // Clear the dialog values when closing
      setDialogName('');
      setDialogCategory('');
      setSystemEditId(null);
    }
  }, [open])

  const createSystem = async (name: string, category: string, parent_system_id: number | null) => {
    await supabase.from('system').insert([{ name, category, parent_system_id }]);
    onUpdate();
    setOpen(false);
  }

  const editSystem = async (id: number, name: string, category: string) => {
    await supabase.from('system').update({ name, category }).eq('id', id);
    onUpdate();
    setOpen(false);
  }

  const openSystemEditDialog = (child: Tables<'system'>) => {
    setDialogName(child.name ?? '');
    setDialogCategory(child.category ?? '');
    setSystemEditId(child.id);
    setOpen(true);
  }

  return <Card className="h-full">
    <CardHeader>
      <CardTitle>System Details</CardTitle>
      <CardDescription>Currently selected parent system</CardDescription>
      <CardAction>
      {system ? (
        <>
          <EditButton onClick={() => openSystemEditDialog(system)} />
          <TrashButton onClick={deleteSystem} />
        </>
      )
      : (
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)}><PlusSquare /></Button>
      )}
      </CardAction>
    </CardHeader>

    <CardContent>
      <SystemFormDialog
        open={open}
        onOpenChange={() => setOpen(!open)}
        name={dialogName}
        category={dialogCategory}
        onNameChange={(val) => setDialogName(val)}
        onCategoryChange={(val) => setDialogCategory(val)}
        onSubmit={() => systemEditId ? editSystem(systemEditId, dialogName, dialogCategory) : createSystem(dialogName, dialogCategory, system?.id ?? null)}
        mode={systemEditId ? 'edit' : 'create'}
      />
      {
        system ? (
          <div>
            <div>
              <p className="text-sm font-bold">Name</p>
              <p className="flex flex-row items-center gap-2">{ system.name } <span className="text-gray-400 text-xs">(#{system.id})</span></p>
            </div>

            <div className="mt-2">
              <p className="text-sm font-bold">Category</p>
              <p>{ system.category ? system.category : (<i>No Category</i>) }</p>
            </div>

            <Separator className="my-6" />

            <CardHeader className="px-0">
              <CardTitle>Sub-Systems</CardTitle>
              <CardDescription>Child and grandchild systems of the parent</CardDescription>
              <CardAction>
                <Button onClick={() => setOpen(true)} variant="ghost" size="sm"><PlusSquare /></Button>
              </CardAction>
            </CardHeader>
            <ul>
              {childSystems.length === 0 ? (
                <li>No child systems</li>
              ) : (
                childSystems.map((child) => (
                  <li key={child.id} className={clsx("flex flex-row items-center group gap-2 h-8", { 'pl-4': child.parent_system_id !== system.id })}>
                    <CornerDownRight className="size-4 text-gray-300" />
                    <div onClick={() => setActiveSystemId(child.id)} className="cursor-pointer">{child.name}</div>
                    <div className="hidden group-hover:block">
                      <EditButton onClick={() => openSystemEditDialog(child)} />
                      <TrashButton onClick={() => deleteChildSystem(child.id)} />
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        ) : (
          <p className="text-gray-500">No system selected</p>
        )
      }
    </CardContent>
  </Card>
};

export default SystemDetails;