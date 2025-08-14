import React from 'react';
import PropTypes from 'prop-types';
import useBuilding from '../state/hooks/useBuilding.tsx';
import BuildingRow from './BuildingRow.jsx';
import { buildingPropType } from './propTypes.js';

export default function BuildingRowContainer({ building, completedResearch }) {
  const { isDesiredOn, resourceShortage, onToggle, ...rest } = useBuilding(
    building,
    completedResearch,
  );
  return (
    <BuildingRow
      building={building}
      isDesiredOn={isDesiredOn}
      resourceShortage={resourceShortage}
      onToggle={onToggle}
      {...rest}
    />
  );
}

BuildingRowContainer.propTypes = {
  building: buildingPropType.isRequired,
  completedResearch: PropTypes.arrayOf(PropTypes.string),
};
