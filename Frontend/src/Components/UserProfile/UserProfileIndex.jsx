import { useState, useContext } from "react";
import { UserContext } from "../../Contexts/UserContexts/UserContext";
import ProfileHeader from "./components/ProfileHeader";
import ProfileInfo from "./components/ProfileInfo";
import ProfileAddress from "./components/ProfileAddress";
import ProfileEmployment from "./components/ProfileEmployment";
import ProfileEmergency from "./components/ProfileEmergency";
import { hybridEncrypt } from "../../Service/auth/auth";

const UserProfileIndex = () => {
  const { user, setUser } = useContext(UserContext);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  if (!user)
    return (
      <div className="flex items-center justify-center h-full text-emerald-700/60 font-semibold">
        Loading...
      </div>
    );

  const handleEdit = () => {
    setDraft(JSON.parse(JSON.stringify(user))); // deep clone
    setEditing(true);
  };

  const handleCancel = () => {
    setDraft(null);
    setEditing(false);
  };

  const handleChange = (path, value) => {
    setDraft((prev) => {
      const next = { ...prev };
      // support nested paths like "address.city"
      const keys = path.split(".");
      let ref = next;
      for (let i = 0; i < keys.length - 1; i++) {
        ref[keys[i]] = { ...ref[keys[i]] };
        ref = ref[keys[i]];
      }
      ref[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = await hybridEncrypt(draft);
      console.log("Encrypted profile payload:", payload);
      // TODO: replace with actual API call e.g. await updateProfile(payload)
      setUser(draft);
      setEditing(false);
      setDraft(null);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const data = editing ? draft : user;

  return (
    <div className="h-[90vh] overflow-auto flex flex-col gap-4 px-1 pb-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h1 className="text-emerald-900 font-bold text-base uppercase tracking-widest">
          My Profile
        </h1>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest text-emerald-800/60 hover:text-emerald-900 bg-white/30 hover:bg-white/50 border border-emerald-300/40 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest text-white bg-emerald-600 hover:brightness-110 hover:scale-[1.02] active:scale-[0.94] border border-emerald-500 transition-all duration-200 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </>
          ) : (
            <button
              onClick={handleEdit}
              className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest text-emerald-800/60 hover:text-emerald-900 bg-white/30 hover:bg-white/50 border border-emerald-300/40 transition-all duration-200"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      <ProfileHeader
        photoUrl={data.photoUrl}
        roleTitle={data.roleTitle}
        displayName={data.displayName}
        username={data.username}
        employeeId={data.employeeId}
        isActive={data.isActive}
        isVerified={data.isVerified}
        editing={editing}
        onChange={handleChange}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProfileInfo
          firstName={data.firstName}
          lastName={data.lastName}
          email={data.email}
          phone={data.phone}
          gender={data.gender}
          editing={editing}
          onChange={handleChange}
        />
        <ProfileEmployment
          employmentType={data.employmentType}
          employmentStatus={data.employmentStatus}
          timezone={data.timezone}
          language={data.language}
          editing={editing}
          onChange={handleChange}
        />
        <ProfileAddress
          address={data.address}
          editing={editing}
          onChange={handleChange}
        />
        <ProfileEmergency
          emergencyContact={data.emergencyContact}
          editing={editing}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default UserProfileIndex;
