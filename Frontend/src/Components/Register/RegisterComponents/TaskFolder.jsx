import CargoMovementsPanel from "./CargoMovementsPanel";
import EmergencyTasksPanel from "./EmergencyTasksPanel";

const TaskFolder = ({ activeSub }) => {
  if (activeSub === "regular") return <CargoMovementsPanel />;

  return <EmergencyTasksPanel />;
};

export default TaskFolder;