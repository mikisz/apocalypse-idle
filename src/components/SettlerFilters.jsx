import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from './ui/checkbox';

export default function SettlerFilters({
  onlyLiving,
  setOnlyLiving,
  unassignedOnly,
  setUnassignedOnly,
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm">
      <div className="flex items-center gap-2">
        <Checkbox
          id="onlyLiving"
          checked={onlyLiving}
          onCheckedChange={(v) => setOnlyLiving(v === true)}
        />
        <label htmlFor="onlyLiving">Only living</label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="unassignedOnly"
          checked={unassignedOnly}
          onCheckedChange={(v) => setUnassignedOnly(v === true)}
        />
        <label htmlFor="unassignedOnly">Unassigned only</label>
      </div>
    </div>
  );
}

SettlerFilters.propTypes = {
  onlyLiving: PropTypes.bool.isRequired,
  setOnlyLiving: PropTypes.func.isRequired,
  unassignedOnly: PropTypes.bool.isRequired,
  setUnassignedOnly: PropTypes.func.isRequired,
};
