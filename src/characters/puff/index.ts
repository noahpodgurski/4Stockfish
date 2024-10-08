import {
  setupActionStates
} from "../../../physics/actionStateShortcuts";
import baseActionStates from "../shared/moves";
import {CHARIDS} from "../../../main/characters";
import moves from './moves';
import {actionStates} from "../../physics/actionStateShortcuts";

const Puff = {
  moves,
  attributes: {},
  ecb: {},
};

export default Puff;

// Remove when actionStates are figured out.
setupActionStates(CHARIDS.PUFF_ID, {
  ...baseActionStates,
  ...Puff.moves,
});


actionStates[CHARIDS.PUFF_ID].ESCAPEB.setVelocities = [0, 0, 0, 0, -0.18636, -0.53714, -0.85504, -1.14006, -1.39219, -1.61143, -1.79778, -1.90176, -1.87565, -1.74509, -1.51009, -1.17065, -0.72676, -0.60977, -0.87285, -1.11128, -1.32504, -1.51414, -1.67857, -1.81834, -1.79778, -1.61143, -1.39219, -1.14006, -0.85504, -0.53714, -0.18636, 0.00168, 0.0028, 0.00056];
actionStates[CHARIDS.PUFF_ID].ESCAPEF.setVelocities = [0, 0, 0, 0, 0, 0.48128, 1.26336, 1.77472, 2.01536, 1.98528, 1.81834, 1.67857, 1.51414, 1.32504, 1.11128, 0.87286, 0.60977, 0.60977, 0.87285, 1.11128, 1.32504, 1.51414, 1.67857, 1.81834, 1.79778, 1.61143, 1.39219, 1.14006, 0.85504, 0.53714, 0.18636, 0.00092, 0.00154, 0.00031];
actionStates[CHARIDS.PUFF_ID].DOWNSTANDB.setVelocities = [-0.06932, -0.07344, -0.07718, -0.08053, -0.08348, -0.08605, -0.17622, -0.34650, -0.50517, -0.65224, -0.78769, -0.91154, -1.02377, -1.1244, -1.21342, -1.29083, -1.35662, -1.41081, -1.4534, -1.48436, -1.50373, -1.51148, -1.50762, -1.49216, -1.46508, -1.42639, -1.37611, -1.31420, -1.24069, -1.15557, 0, 0, 0, 0, 0];
actionStates[CHARIDS.PUFF_ID].DOWNSTANDF.setVelocities = [0.01598, 0.00249, -0.00243, 0.00123, 0.01347, 0.0343, 0.0637, 0.10167, 0.2669, 0.53622, 0.7794, 0.99642, 1.1873, 1.35203, 1.49061, 1.60305, 1.68934, 1.74948, 1.78347, 1.79132, 1.77302, 1.72857, 1.65796, 1.56122, 1.43833, 1.28929, 1.11411, 0.91276, 0.68529, 0.43165, 0.15188, 0.00338, 0.00283, 0.00114, -0.00169];
actionStates[CHARIDS.PUFF_ID].TECHB.setVelocities = [0, 0.51119, 1.12463, 1.12463, 0.51119, -1.15217, -2.11948, -2.01629, -2.15974, -2.27333, -2.35708, -2.41098, -2.43502, -2.42922, -2.39356, -2.32805, -2.2327, -2.10749, -1.95244, -1.76753, -1.55278, -1.30817, -1.03371, -0.72941, -0.51981, -0.42778, -0.34013, -0.25689, -0.17805, -0.1036, -0.03356, 0.63449, 1.17833, 0.63449, 0, 0, 0, 0, 0, 0];
actionStates[CHARIDS.PUFF_ID].TECHF.setVelocities = [0, -0.39214, -0.86272, -0.86272, -0.39214, 0.75185, 1.75788, 2.16647, 2.43012, 2.62609, 2.75436, 2.81494, 2.80783, 2.73303, 2.59053, 2.38034, 2.10247, 1.7569, 1.34363, 0.86268, 0.31404, 0.01548, 0.01231, 0.00939, 0.00673, 0.00433, 0.00219, 0.0003, -0.00133, -0.00270, -0.00382, -0.00467, -0.00527, -0.00562, -0.00570, -0.00553, -0.00510, -0.00442, -0.00347, -0.00277];
actionStates[CHARIDS.PUFF_ID].CLIFFCATCH.posOffset = [[-74.289, -8.13664], [-73.93011, -8.48632], [-73.54061, -8.90368], [-73.22807, -9.25336], [-73.1, -9.4], [-73.1, -9.4], [-73.1, -9.4]];
actionStates[CHARIDS.PUFF_ID].CLIFFWAIT.posOffset = [-73.1, -9.4];
