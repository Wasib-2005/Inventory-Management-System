import { useState } from "react";
import { CiEdit } from "react-icons/ci";
import { MdOutlineDeleteOutline } from "react-icons/md";
import UserAvatar from "./UserAvatar";
import { InfoTab, AddressTab, EmergencyTab, FlagsTab } from "./DetailTabs";
import { HiMiniXMark } from "react-icons/hi2";
import { commonComponentBG } from "../../../Theme/commonComponentBG";

const TABS = ["Info", "Address", "Emergency", "Flags"];

const setNestedValue = (obj, path, value) => {
  const keys = path.split(".");
  if (keys.length === 1) return { ...obj, [path]: value };
  return {
    ...obj,
    [keys[0]]: setNestedValue(obj[keys[0]] ?? {}, keys.slice(1).join("."), value),
  };
};

const UserDetailPanel = ({ user, onSave, onDelete, setSelectedId }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [activeTab, setActiveTab] = useState("Info");

  const handleEdit = () => {
    setDraft({ ...user });
    setEditing(true);
  };

  const handleCancel = () => {
    setDraft(null);
    setEditing(false);
  };

  const handleChange = (key, value) => {
    console.log(key, value)
    setDraft((prev) => setNestedValue(prev, key, value));
  };

  const handleSave = () => {
    onSave(draft);
    setEditing(false);
    setDraft(null);
  };

  const handleDelete = () => {
    if (confirm(`Delete ${user.firstName} ${user.lastName}? This cannot be undone.`)) {
      onDelete(user._id);
    }
  };

  const current = editing ? draft : user;
  const tabProps = { user: current, editing, onChange: handleChange };

  return (
    <div className={`flex flex-col h-full overflow-hidden ${commonComponentBG("l")} overflow-auto`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-(--color-border-tertiary) shrink-0 bg-[var(--color-background-primary)]">
        <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--color-text-secondary)]">
          <UserAvatar user={user} size="sm" />
          {user.firstName} {user.lastName}
        </div>
        <button
          onClick={() => setSelectedId(" ")}
          className="md:hidden hover:bg-red-600 p-1 rounded-full hover:border border-red-900 hover:text-white"
        >
          <HiMiniXMark />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-(--color-border-tertiary) shrink-0 bg-[var(--color-background-primary)]">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-2 text-[12px] font-medium border-b-2 transition-colors
              ${activeTab === tab
                ? "text-[#1D9E75] border-[#1D9E75]"
                : "text-(--color-text-tertiary) border-transparent hover:text-[var(--color-text-secondary)]"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "Info" && <InfoTab {...tabProps} />}
        {activeTab === "Address" && <AddressTab {...tabProps} />}
        {activeTab === "Emergency" && <EmergencyTab {...tabProps} />}
        {activeTab === "Flags" && <FlagsTab {...tabProps} />}
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-t border-(--color-border-tertiary) shrink-0 bg-[var(--color-background-primary)]">
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 h-7 px-2.5 text-[12px] font-medium rounded-md border border-[#F7C1C1] text-[#A32D2D] hover:bg-[#FCEBEB] transition-colors"
        >
          <MdOutlineDeleteOutline size={14} />
          Delete
        </button>

        <div className="flex-1" />

        {editing ? (
          <>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 h-7 px-2.5 text-[12px] font-medium rounded-md border border-(--color-border-secondary) hover:bg-(--color-background-secondary) transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 h-7 px-2.5 text-[12px] font-medium rounded-md bg-[#1D9E75] text-white border border-[#0F6E56] hover:bg-[#0F6E56] transition-colors"
            >
              Save changes
            </button>
          </>
        ) : (
          <button
            onClick={handleEdit}
            className="flex items-center gap-1.5 h-7 px-2.5 text-[12px] font-medium rounded-md bg-[#1D9E75] text-white border border-[#0F6E56] hover:bg-[#0F6E56] transition-colors"
          >
            <CiEdit size={14} />
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default UserDetailPanel;