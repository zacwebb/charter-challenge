import { Tables } from "@/types/supabase";
import { Input } from "@/components/ui/input"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface SystemDetailsProps {
  system: Tables<'system'> | null;
  onUpdate: () => void;
}

const SystemDetails = ({ system, onUpdate }: SystemDetailsProps) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    setName(system?.name || "");
    setCategory(system?.category || "");
  }, [system]);

  const updateName = async () => {
    if (!system) return;
  
    await supabase
      .from('system')
      .update({ name })
      .eq('id', system.id);

    onUpdate();
  }

  const updateCategory = async () => {
    if (!system) return;

    await supabase
      .from('system')
      .update({ category })
      .eq('id', system.id);

    onUpdate();
  }

  const deleteSystem = async () => {
    if (!system) return;

    await supabase
      .from('system')
      .delete()
      .eq('id', system.id);

    onUpdate();
  }

  return <Card>
    <CardHeader>
      <CardTitle>System Details</CardTitle>
      {system ? (
        <CardAction>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => deleteSystem()} size="sm" variant="ghost" className="text-red-800 hover:bg-red-50 hover:text-red-800"><Trash2 /></Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete system</p>
            </TooltipContent>
          </Tooltip>
        </CardAction>
      ) : null}
    </CardHeader>

    <CardContent>
      {
        system ? (
          <div>
            <p>ID: {system.id}</p>
            <div className="flex flex-row gap-2">
              <Input
                defaultValue={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Button onClick={() => updateName()} variant="outline">Save</Button>
            </div>

            <div className="flex flex-row gap-2">
              <Input
                defaultValue={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <Button onClick={() => updateCategory()} variant="outline">Save</Button>
            </div>
            
          </div>
        ) : (
          <p className="text-gray-500">No system selected</p>
        )
      }
    </CardContent>
  </Card>
};

export default SystemDetails;