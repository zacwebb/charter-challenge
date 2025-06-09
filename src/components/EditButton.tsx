import { Edit } from 'lucide-react'
import { Button } from './ui/button'

const EditButton = ({ onClick }: { onClick: () => void }) => {
  return <Button size="sm" variant="ghost" onClick={onClick}><Edit /></Button>
}

export default EditButton
