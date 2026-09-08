import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { MOVEMENT_TYPE_META } from "./OrderComponents/movementConstants";
import {
  recordCycleCountDiscrepancy,
  recordMovementDiscrepancy,
  getWarehouseById,
  verifyStockTask,
} from "./api";
import { makeImageUrl } from "../../../Service/auth/makeImageUrl";
import { formatNumber } from "../../../utility/formatNumber";
import LocationPicker from "./OrderComponents/LocationPicker";

const Row = ({ label, value }) => {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex justify-between gap-3 py-1.5 border-b border-emerald-100 last:border-0">
      <span className="text-[10px] font-bold text-emerald-700/50 uppercase shrink-0">
        {label}
      </span>
      <span className="text-[12px] font-semibold text-emerald-900 text-right break-words">
        {value}
      </span>
    </div>
  );
};

const MovementDetailModal = ({ record, isOpen, onClose, onEdit, onVerified }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [discrepancyNote, setDiscrepancyNote] = useState("");
  const [discrepancyItems, setDiscrepancyItems] = useState([]);
  const [isRecordingDiscrepancy, setIsRecordingDiscrepancy] = useState(false);
  const [discrepancyMessage, setDiscrepancyMessage] = useState("");
  const [countDiscrepancy, setCountDiscrepancy] = useState({
    description: "",
    expectedQty: "",
    actualQty: "",
    rackCode: "",
    shelfCode: "",
  });
  const [verificationMode, setVerificationMode] = useState("verify_only");
  const [putAwayWarehouse, setPutAwayWarehouse] = useState(null);

  useEffect(() => {
    if (!record) return;
    setVerificationMode("verify_only");
    setDiscrepancyNote(record.discrepancy?.note || "");
    setDiscrepancyItems((record.items || []).map((item) => ({
      productData: item.productData?._id || item.productData || item.productId,
      qty: item.qty,
      receivedQty: item.receivedQty ?? (record._type === "inbound" ? "" : item.qty),
      discrepancyNote: item.discrepancyNote || "",
      sourceLocation: item.sourceLocation || {},
      destinationLocation: item.destinationLocation || {},
      destinationLocations: item.destinationLocations?.length
        ? item.destinationLocations
        : [{ ...(item.destinationLocation || {}), qty: item.receivedQty || item.qty }],
    })));
  }, [record]);

  useEffect(() => {
    if (record?._type !== "inbound" || !record.toWarehouseId?._id) {
      setPutAwayWarehouse(null);
      return undefined;
    }
    const controller = new AbortController();
    getWarehouseById(record.toWarehouseId._id, controller.signal)
      .then((response) => setPutAwayWarehouse(response.data?.data || null))
      .catch((error) => {
        if (error.name !== "CanceledError") setPutAwayWarehouse(null);
      });
    return () => controller.abort();
  }, [record]);

  if (!isOpen || !record) return null;
  const meta = MOVEMENT_TYPE_META[record._type];
  const Icon = meta.icon;
  const isCount = record._type === "count";
  const verificationStatus = record.verification?.status || "pending";
  const canPutAway =
    record._type === "inbound" &&
    (verificationStatus === "pending" ||
      (verificationStatus === "verified" && record.verification?.mode === "verify_only"));
  const getPersonName = (person) =>
    person?.displayName || person?.username || "Not assigned";
  const getProductImages = (product) =>
    [product?.image?.header, ...(product?.image?.extra || [])].filter(Boolean);

  const handleRecordDiscrepancy = async () => {
    setIsRecordingDiscrepancy(true);
    setDiscrepancyMessage("");
    try {
      if (isCount) {
        if (!countDiscrepancy.description.trim()) throw new Error("Describe the count mismatch.");
        await recordCycleCountDiscrepancy(record._id, { discrepancies: [countDiscrepancy] });
      } else {
        const hasMismatch = discrepancyItems.some(
          (item) => item.receivedQty !== "" && Number(item.receivedQty) !== Number(item.qty),
        );
        if (!hasMismatch) throw new Error("Change at least one actual quantity to record a mismatch.");
        await recordMovementDiscrepancy(record._id, {
          items: discrepancyItems,
          note: discrepancyNote,
        });
      }
      setDiscrepancyMessage("Mismatch recorded and sent for emergency resolution.");
      onVerified?.();
    } catch (error) {
      setDiscrepancyMessage(error.response?.data?.message || error.message);
    } finally {
      setIsRecordingDiscrepancy(false);
    }
  };

  const handleVerify = async (status) => {
    setIsVerifying(true);
    setVerifyError("");
    try {
      if (status === "verified" && record._type === "inbound" && verificationMode === "verify_and_put") {
        const invalidItem = discrepancyItems.find((item) => {
          const confirmedQty = Number(item.receivedQty === "" ? item.qty : item.receivedQty);
          const locations = item.destinationLocations || [];
          const allocatedQty = locations.reduce(
            (total, location) =>
              total + Number(location.qty === "" || location.qty === undefined ? confirmedQty : location.qty),
            0,
          );
          return (
            !Number.isFinite(confirmedQty) ||
            confirmedQty <= 0 ||
            locations.length === 0 ||
            locations.some((location) =>
              !location.rackId ||
              !location.shelfId ||
              Number(location.qty === "" || location.qty === undefined ? confirmedQty : location.qty) <= 0,
            ) ||
            Math.abs(allocatedQty - confirmedQty) > 0.000001
          );
        });
        if (invalidItem) {
          throw new Error("Select a rack and shelve for every allocation, and make sure allocation quantities equal the confirmed quantity.");
        }
      }
      await verifyStockTask(record._type, record._id, status, "", {
        verificationMode,
        items: discrepancyItems,
      });
      onVerified?.();
      onClose();
    } catch (error) {
      setVerifyError(error.response?.data?.message || "Could not update verification.");
    } finally {
      setIsVerifying(false);
    }
  };

  // TODO: multi-rack shape (`record.racks`) is unconfirmed on the backend —
  // falls back to the old single-rack (`record.rackCode` / `record.shelves`) shape.
  const rackGroups =
    record.racks?.map((rack) => ({
      ...rack,
      rackCode: rack.rackCode || rack.rackId?.rackCode,
      allShelves: rack.shelfScope === "all",
      shelves:
        rack.shelfScope === "one"
          ? [
              {
                shelfCode: rack.shelfCode || rack.shelfId?.shelfCode,
              },
            ]
          : [],
    })) ||
    (record.rackCode
      ? [{ rackCode: record.rackCode, shelves: record.shelves }]
      : []);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-emerald-300/30">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-md border flex items-center justify-center ${meta.accent}`}
            >
              <Icon size={14} />
            </div>
            <div>
              <h3 className="font-bold text-emerald-900 text-sm">
                {record.reference || meta.label}
              </h3>
              <p className="text-[10px] text-emerald-700/50">{meta.label}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-emerald-700/40 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <div className="rounded-lg border border-emerald-200 p-3">
            <Row label="Reference" value={record.reference} />
            <Row
              label="Date"
              value={
                record.date
                  ? new Date(record.date).toLocaleString()
                  : record.createdAt
                    ? new Date(record.createdAt).toLocaleString()
                    : "—"
              }
            />
            <Row label="Track Code" value={record.trackCode} />
            <Row label="From" value={record.fromWarehouseId?.name} />
            <Row
              label={record._type === "outbound" ? "Sender" : "Source"}
              value={
                record._type === "outbound"
                  ? getPersonName(record.dispatchedBy)
                  : record.supplier?.name || getPersonName(record.createdBy)
              }
            />
            <Row
              label={record._type === "inbound" ? "Receiver" : "Destination"}
              value={
                record._type === "inbound"
                  ? getPersonName(record.receivedBy)
                  : record.supplier?.name || record.toWarehouseId?.warehouseName
              }
            />
            <Row label="From Warehouse" value={record.fromWarehouseId?.warehouseName} />
            <Row label="To Warehouse" value={record.toWarehouseId?.warehouseName} />
            <Row
              label="Source Location"
              value={
                record.sourceLocation?.rackCode
                  ? `${record.sourceLocation.rackCode} / ${record.sourceLocation.shelfCode}`
                  : null
              }
            />
            <Row
              label="Put-away Location"
              value={
                record.destinationLocation?.rackCode
                  ? `${record.destinationLocation.rackCode} / ${record.destinationLocation.shelfCode}`
                  : null
              }
            />
            <Row label="Supplier" value={record.supplier?.name || record.supplier?.companyName} />
            <Row
              label="Supply Date"
              value={
                record.supplyDate
                  ? new Date(record.supplyDate).toLocaleDateString()
                  : null
              }
            />
            <Row
              label="Handled By"
              value={
                record.receivedBy?.displayName ||
                record.dispatchedBy?.displayName
              }
            />
            <Row label="Counted By" value={record.countedBy?.displayName} />
            <Row label="Created By" value={getPersonName(record.createdBy)} />
            <Row label="Notes" value={record.notes} />
            <Row label="Verification" value={verificationStatus} />
            <Row label="Verification Note" value={record.verification?.note} />
          </div>

          {!isCount && (
            <div>
              <h4 className="text-xs font-bold text-emerald-800 tracking-wide uppercase mb-1.5">
                Products ({record.items?.length || 0})
              </h4>
              <div className="flex flex-col gap-1.5">
                {(record.items || []).map((item, i) => {
                  const product = item.productData || item.product || item;
                  const images = getProductImages(product);
                  return (
                <div
                  key={product._id || item.productId || i}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg bg-emerald-50/40 border border-emerald-300/30"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {images.length > 0 ? (
                      <div className="flex -space-x-1 shrink-0">
                        {images.map((image, imageIndex) => (
                          <img
                            key={`${image}-${imageIndex}`}
                            src={makeImageUrl(image)}
                            alt=""
                            className="w-8 h-8 rounded-md object-cover border-2 border-white"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200 shrink-0" />
                    )}
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-emerald-900 truncate">
                      {product.name || item.name || "Unknown product"}
                    </p>
                    <p className="text-[10px] text-emerald-700/50">
                      {product.sku || item.sku || product.displayId}
                    </p>
                    {record._type === "outbound" && item.sourceLocation?.rackCode && (
                      <p className="text-[10px] text-amber-700/70">
                        Source: {item.sourceLocation.rackCode} / {item.sourceLocation.shelfCode}
                      </p>
                    )}
                    {record._type === "inbound" &&
                      (item.destinationLocations || [item.destinationLocation]).filter(Boolean).map((location, locationIndex) =>
                        location?.rackCode ? (
                          <p key={`${location.shelfId || locationIndex}`} className="text-[10px] text-blue-700/70">
                            Put-away: {location.rackCode} / {location.shelfCode} ({formatNumber(location.qty)})
                          </p>
                        ) : null,
                      )}
                  </div>
                  </div>
                  <span className="text-[12px] font-bold text-emerald-700 shrink-0">
                    {item.receivedQty == null
                      ? `×${formatNumber(item.qty)}`
                      : `${formatNumber(item.receivedQty)}/${formatNumber(item.qty)}`}
                  </span>
                </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-3">
            <h4 className="text-xs font-bold uppercase tracking-wide text-rose-800">
              Record mismatch
            </h4>
            {!isCount ? (
              <div className="flex flex-col gap-2 mt-2">
                {discrepancyItems.map((item, index) => {
                  const source = record.items?.[index];
                  const product = source?.productData || source?.product || source;
                  return (
                    <div key={item.productData || index} className="grid grid-cols-[1fr_80px] gap-2 items-center">
                      <span className="text-[11px] text-rose-900 truncate">{product?.name || "Product"} (expected {formatNumber(item.qty)})</span>
                      <input
                        type="number"
                        min="0"
                        value={item.receivedQty}
                        onChange={(event) => setDiscrepancyItems((items) => items.map((current, itemIndex) => itemIndex === index ? { ...current, receivedQty: event.target.value } : current))}
                        className="text-xs px-2 py-1.5 rounded border border-rose-200"
                        placeholder="Actual"
                      />
                    </div>
                  );
                })}
                <input value={discrepancyNote} onChange={(event) => setDiscrepancyNote(event.target.value)} placeholder="What went wrong?" className="text-xs px-2 py-1.5 rounded border border-rose-200" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <input value={countDiscrepancy.description} onChange={(event) => setCountDiscrepancy((value) => ({ ...value, description: event.target.value }))} placeholder="What was different?" className="col-span-2 text-xs px-2 py-1.5 rounded border border-rose-200" />
                <input type="number" value={countDiscrepancy.expectedQty} onChange={(event) => setCountDiscrepancy((value) => ({ ...value, expectedQty: event.target.value }))} placeholder="Expected" className="text-xs px-2 py-1.5 rounded border border-rose-200" />
                <input type="number" value={countDiscrepancy.actualQty} onChange={(event) => setCountDiscrepancy((value) => ({ ...value, actualQty: event.target.value }))} placeholder="Counted" className="text-xs px-2 py-1.5 rounded border border-rose-200" />
                <input value={countDiscrepancy.rackCode} onChange={(event) => setCountDiscrepancy((value) => ({ ...value, rackCode: event.target.value }))} placeholder="Rack" className="text-xs px-2 py-1.5 rounded border border-rose-200" />
                <input value={countDiscrepancy.shelfCode} onChange={(event) => setCountDiscrepancy((value) => ({ ...value, shelfCode: event.target.value }))} placeholder="Shelves" className="text-xs px-2 py-1.5 rounded border border-rose-200" />
              </div>
            )}
            <button type="button" disabled={isRecordingDiscrepancy} onClick={handleRecordDiscrepancy} className="mt-2 px-3 py-1.5 rounded-md bg-rose-600 text-white text-xs font-bold disabled:opacity-50">
              {isRecordingDiscrepancy ? "Recording..." : "Record mismatch"}
            </button>
            {discrepancyMessage && <p className="text-[11px] text-rose-700 mt-2">{discrepancyMessage}</p>}
          </div>

          {isCount && (
            <div className="flex flex-col gap-3">
              <div className="rounded-lg border border-purple-200 bg-purple-50/60 p-3">
                <p className="text-xs font-bold text-purple-800">Cycle count task</p>
                <p className="text-[11px] text-purple-700/70 mt-1">
                  Count the physical stock in the assigned scope, record discrepancies, and submit the result for verification.
                </p>
                <Row label="Assigned Counter" value={getPersonName(record.countedBy)} />
                <Row label="Warehouse" value={record.warehouseId?.warehouseName} />
                <Row
                  label="Scope"
                  value={
                    record.rackScope === "all"
                      ? "All racks and shelves"
                      : `${record.racks?.length || 0} selected rack(s)`
                  }
                />
              </div>
              {rackGroups.map((rack, ri) => (
                <div
                  key={ri}
                  className="rounded-lg border border-purple-200 p-3"
                >
                  <p className="text-[11px] font-bold text-purple-700 uppercase mb-2">
                    Rack: {rack.rackCode || rack.rackId?.rackCode}{" "}
                    {rack.allShelves ? "(all shelves)" : ""}
                  </p>

                  {rack.allShelves ? (
                    <div className="flex flex-col gap-1">
                      {(rack.items || []).map((item, ii) => (
                        <div
                          key={ii}
                          className="flex justify-between text-[12px] py-0.5"
                        >
                          <span className="text-emerald-900">{item.name}</span>
                          <span className="font-bold text-emerald-700">
                            ×{formatNumber(item.qty)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {(rack.shelves || []).map((shelf, si) => (
                        <div
                          key={si}
                          className="rounded-md bg-purple-50/40 border border-purple-200/50 p-2"
                        >
                          <p className="text-[10px] font-bold text-purple-700/70 uppercase mb-1">
                            Shelves: {shelf.shelfCode}{" "}
                            {shelf.isNewShelf ? "(new)" : ""}
                          </p>
                          {(shelf.items || []).map((item, ii) => (
                            <div
                              key={ii}
                              className="flex justify-between text-[12px] py-0.5"
                            >
                              <span className="text-emerald-900">
                                {item.name}
                              </span>
                              <span className="font-bold text-emerald-700">
                                ×{formatNumber(item.qty)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}

          {canPutAway && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-base font-bold text-blue-900">
                    Inbound verification
                  </h4>
                  <p className="mt-1 text-base text-blue-700/80">
                    Choose whether to verify the delivery now or verify it and put stock away.
                  </p>
                </div>
                {verificationStatus === "verified" && (
                  <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-base font-semibold text-amber-800">
                    Awaiting put-away
                  </span>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                {[
                  ["verify_only", "Verify without putting away"],
                  ["verify_and_put", "Verify and put on shelves"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setVerificationMode(value)}
                    className={`flex-1 text-base font-bold rounded-md px-3 py-3 border ${
                      verificationMode === value
                        ? "bg-white border-blue-400 text-blue-700"
                        : "border-blue-200 text-blue-700/60"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {verificationMode === "verify_and_put" && (
                <div className="flex flex-col gap-2 mt-2">
                  <p className="text-base text-blue-700/80">
                    Split each product across as many racks and shelves as needed. Allocation quantities must equal the confirmed quantity.
                  </p>
                  {discrepancyItems.map((item, index) => {
                    const source = record.items?.[index];
                    const product = source?.productData || source?.product || source;
                    return (
                      <div key={item.productData || index} className="rounded-lg border border-blue-200 bg-white p-3 flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-base font-bold text-blue-900">
                            {product?.name || "Product"}
                          </p>
                          <label className="flex items-center gap-2 text-base text-blue-800">
                            Confirmed quantity
                          <input
                            type="number"
                            min="0"
                            value={item.receivedQty}
                            onChange={(event) =>
                              setDiscrepancyItems((current) =>
                                current.map((entry, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...entry,
                                        receivedQty: event.target.value,
                                        destinationLocations:
                                          entry.destinationLocations.length === 1
                                            ? entry.destinationLocations.map((location) => ({
                                                ...location,
                                                qty: event.target.value,
                                              }))
                                            : entry.destinationLocations,
                                      }
                                    : entry,
                                ),
                              )
                            }
                            className="w-24 text-base px-2 py-2 rounded border border-blue-200 bg-white"
                          />
                          </label>
                        </div>
                        {(item.destinationLocations || []).map((location, locationIndex) => (
                          <div key={`${item.productData || index}-${locationIndex}`} className="flex flex-col gap-1">
                            <LocationPicker
                              warehouse={putAwayWarehouse}
                              value={location}
                              onChange={(destinationLocation) =>
                                setDiscrepancyItems((current) =>
                                  current.map((entry, itemIndex) =>
                                    itemIndex === index
                                      ? {
                                          ...entry,
                                          destinationLocations: entry.destinationLocations.map((entryLocation, entryLocationIndex) =>
                                            entryLocationIndex === locationIndex
                                              ? { ...entryLocation, ...destinationLocation }
                                              : entryLocation,
                                          ),
                                        }
                                      : entry,
                                  ),
                                )
                              }
                              label={`Destination ${locationIndex + 1}`}
                            />
                            <div className="flex items-center justify-between gap-2">
                              <label className="text-base text-blue-800">Quantity for this shelve</label>
                              <input
                                type="number"
                                min="0"
                                value={location.qty}
                                onChange={(event) =>
                                  setDiscrepancyItems((current) =>
                                    current.map((entry, itemIndex) =>
                                      itemIndex === index
                                        ? {
                                            ...entry,
                                            destinationLocations: entry.destinationLocations.map((entryLocation, entryLocationIndex) =>
                                              entryLocationIndex === locationIndex
                                                ? { ...entryLocation, qty: event.target.value }
                                                : entryLocation,
                                            ),
                                          }
                                        : entry,
                                    ),
                                  )
                                }
                                className="w-24 text-base px-2 py-2 rounded border border-blue-200 bg-white"
                              />
                              {item.destinationLocations.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDiscrepancyItems((current) =>
                                      current.map((entry, itemIndex) =>
                                        itemIndex === index
                                          ? {
                                              ...entry,
                                              destinationLocations: entry.destinationLocations.filter(
                                                (_, entryLocationIndex) => entryLocationIndex !== locationIndex,
                                              ),
                                            }
                                          : entry,
                                      ),
                                    )
                                  }
                                  className="text-base font-bold text-rose-600"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            setDiscrepancyItems((current) =>
                              current.map((entry, itemIndex) =>
                                itemIndex === index
                                  ? { ...entry, destinationLocations: [...entry.destinationLocations, { qty: 0 }] }
                                  : entry,
                              ),
                            )
                          }
                          className="self-start text-base font-bold text-blue-700 underline"
                        >
                          + Add another rack or shelve
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-emerald-300/30 flex flex-wrap gap-2">
          {(verificationStatus === "pending" || canPutAway) && (
            <>
              {verificationStatus === "pending" && !isCount && <button
                type="button"
                disabled={isVerifying}
                onClick={() => handleVerify("rejected")}
                className="px-3 py-2 rounded-lg font-semibold text-xs text-rose-700 bg-rose-50 border border-rose-200 disabled:opacity-50"
              >
                Reject
              </button>}
              <button
                type="button"
                disabled={isVerifying || (verificationStatus === "verified" && verificationMode !== "verify_and_put")}
                onClick={() => handleVerify("verified")}
                className="px-3 py-2 rounded-lg font-semibold text-base text-white bg-emerald-600 disabled:opacity-50"
              >
                {verificationStatus === "verified" ? "Complete put-away" : "Verify"}
              </button>
            </>
          )}
          {verifyError && <p className="w-full text-xs text-rose-600">{verifyError}</p>}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg font-semibold text-sm text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default MovementDetailModal;
