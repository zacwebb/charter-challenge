import { Trash2 } from "lucide-react";
import { Button } from "./ui/button";

const TrashButton = ({ onClick }: { onClick: () => void }) => {
  return <Button onClick={onClick} size="sm" variant="ghost" className="text-red-800 hover:bg-red-50 hover:text-red-800"><Trash2 /></Button>
}

export default TrashButton;