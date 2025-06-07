import { Tables } from "@/types/supabase";

interface SystemDetailsProps {
  system: Tables<'system'> | null;
}

const SystemDetails = ({ system }: SystemDetailsProps) => {
  return <div>
    <h2>Current System Details</h2>
    {
      system ? (
        <div>
          <p>ID: {system.id}</p>
          <p>Name: {system.name}</p>
          <p>Category: {system.category}</p>
        </div>
      ) : (
        <p>No system selected</p>
      )
    }
  </div>
};

export default SystemDetails;