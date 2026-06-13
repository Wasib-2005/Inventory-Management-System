export const commonComponentBG = (side = "") => {
  if (side === "r")
    return "bg-white/70 backdrop-blur shadow-[0_2px_12px_rgba(47,160,132,0.1),inset_0_1px_0_rgba(255,255,255,0.6)] rounded-r-2xl  border border-emerald-300/50 flex flex-col gap-3";
  else if (side === "l")
    return "bg-white/70 backdrop-blur shadow-[0_2px_12px_rgba(47,160,132,0.1),inset_0_1px_0_rgba(255,255,255,0.6)] rounded-l-2xl  border border-emerald-300/50 flex flex-col gap-3";
  else
    return "bg-white/70 backdrop-blur shadow-[0_2px_12px_rgba(47,160,132,0.1),inset_0_1px_0_rgba(255,255,255,0.6)] rounded-2xl  border border-emerald-300/50 flex flex-col gap-3";
};
