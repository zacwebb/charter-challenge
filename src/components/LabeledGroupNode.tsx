import { memo } from "react";
 
import { NodeProps } from "@xyflow/react";
import { GroupNode } from "@/components/labeled-group-node";
 
const LabeledGroupNode = memo(({ selected, data }: NodeProps) => {
  return <GroupNode selected={selected} label={data.label as string} />;
});
 
export default LabeledGroupNode;