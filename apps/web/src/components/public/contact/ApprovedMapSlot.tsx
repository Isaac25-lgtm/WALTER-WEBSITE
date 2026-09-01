export type MapCoordinate = {
  lat?: number;
  lng?: number;
};

export function ApprovedMapSlot({ coordinates }: { coordinates: readonly unknown[] }) {
  if (coordinates.length === 0) return null;

  return (
    <div className="approved-map" aria-label="Location map">
      {/* Future approved provider embed only. No scripts or invented pins in this prompt. */}
    </div>
  );
}
