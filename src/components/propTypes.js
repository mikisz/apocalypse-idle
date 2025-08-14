import PropTypes from 'prop-types';

export const buildingPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  maxCount: PropTypes.number,
  capacityAdd: PropTypes.object,
  requiresResearch: PropTypes.string,
  cardTextOverride: PropTypes.string,
});

export default {
  buildingPropType,
};
