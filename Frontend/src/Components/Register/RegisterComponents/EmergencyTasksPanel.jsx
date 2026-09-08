import { useEffect, useState } from "react";
import { FiAlertTriangle, FiPlus } from "react-icons/fi";
import { createEmergencyTask, getEmergencyTasks, updateEmergencyTask } from "./api";

const EmergencyTasksPanel = () => {
  const [tasks, setTasks] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "high" });
  const [error, setError] = useState("");

  const load = () => getEmergencyTasks().then((response) => setTasks(response.data?.data || [])).catch((err) => setError(err.response?.data?.message || "Could not load emergency tasks."));
  useEffect(() => { load(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await createEmergencyTask(form);
      setForm({ title: "", description: "", priority: "high" });
      setIsCreating(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create emergency task.");
    }
  };

  const resolve = async (task) => {
    try {
      await updateEmergencyTask(task._id, { status: "resolved", resolution: "Resolved from emergency task tab." });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update emergency task.");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-rose-900">Emergency Resolution</h3>
          <p className="text-xs text-rose-700/60">Resolve inbound shortages, count mismatches, and urgent warehouse issues.</p>
        </div>
        <button type="button" onClick={() => setIsCreating((value) => !value)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold">
          <FiPlus size={14} /> Create Task
        </button>
      </div>

      {isCreating && (
        <form onSubmit={submit} className="rounded-lg border border-rose-200 bg-rose-50/50 p-3 flex flex-col gap-2">
          <input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Task title" className="text-sm px-3 py-2 rounded border border-rose-200" />
          <textarea required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What must be resolved?" rows={3} className="text-sm px-3 py-2 rounded border border-rose-200" />
          <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })} className="text-sm px-3 py-2 rounded border border-rose-200">
            <option value="critical">Critical</option>
            <option value="high">High</option>
          </select>
          <button type="submit" className="self-start px-3 py-2 rounded bg-rose-600 text-white text-xs font-bold">Save emergency task</button>
        </form>
      )}

      {error && <p className="text-xs text-rose-700">{error}</p>}
      {tasks.length === 0 ? (
        <p className="text-xs text-emerald-700/50 italic">No emergency tasks recorded.</p>
      ) : tasks.map((task) => (
        <div key={task._id} className="flex items-start justify-between gap-3 rounded-lg border border-rose-200 bg-white p-3">
          <div className="flex gap-2 min-w-0">
            <FiAlertTriangle className="text-rose-600 mt-0.5 shrink-0" size={16} />
            <div className="min-w-0">
              <p className="text-xs font-bold text-rose-900">{task.title}</p>
              <p className="text-xs text-emerald-900/70 whitespace-pre-wrap">{task.description}</p>
              <p className="text-[10px] uppercase text-rose-600 mt-1">{task.priority} · {task.status.replace("_", " ")}</p>
            </div>
          </div>
          {task.status !== "resolved" && <button type="button" onClick={() => resolve(task)} className="shrink-0 px-2 py-1 rounded bg-emerald-600 text-white text-[10px] font-bold">Resolve</button>}
        </div>
      ))}
    </div>
  );
};

export default EmergencyTasksPanel;
