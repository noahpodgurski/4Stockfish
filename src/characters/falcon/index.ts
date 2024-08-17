import {setupActionStates} from "../../physics/actionStateShortcuts";
import baseActionStates from "../shared/moves";
import {CHARIDS} from "../../main/characters";
import moves from "./moves";
import {actionStates} from "physics/actionStateShortcuts";

const Falcon = {
  moves,
  attributes: {},
  ecb: {},
};

export default Falcon;

// Remove when actionStates are figured out.
setupActionStates(CHARIDS.FALCON_ID, {
  ...baseActionStates,
  ...Falcon.moves,
});

actionStates[CHARIDS.FALCON_ID].ESCAPEB.setVelocities = [0.00021,0.00021,-0.00042,-0.83938,-2.09726,-2.72666,-2.72758,-2.39759,-2.16996,-1.96375,-1.77895,-1.61556,-1.4736,-1.35304,-1.2539,-1.17617,-1.11987,-1.08498,-1.07149,-1.07943,-1.04179,-0.94375,-0.8449,-0.74524,-0.64477,-0.54348,-0.44139,-0.33847,-0.23476,-0.13022,-0.02488];
actionStates[CHARIDS.FALCON_ID].ESCAPEF.setVelocities = [3.06269,2.87291,2.68919,2.51153,2.33994,2.17441,2.01495,1.86155,1.71421,1.57294,1.43773,1.30858,1.1855,1.06848,0.95753,0.85264,0.75381,0.66105,0.57435,0.49371,0.41914,0.35064,0.2882,0.23181,0.1815,0.13725,0.09906,0.06693,0.04087,0.02088,0.00694];
actionStates[CHARIDS.FALCON_ID].DOWNSTANDB.setVelocities = [-0.18881,-0.24149,-0.52075,-1.09628,-1.63184,-1.86136,-1.95365,-2.02141,-2.06463,-2.08331,-2.07746,-2.04706,-1.99213,-1.91266,-1.80865,-1.68011,-1.52701,-1.3494,-1.15914,-0.98313,-0.82294,-0.67854,-0.54995,-0.43716,-0.34018,-0.25899,-0.19361,-0.14403,-0.11026,-0.08107,-0.05119,-0.02913,-0.01491,-0.00853,-0.00998];
actionStates[CHARIDS.FALCON_ID].DOWNSTANDF.setVelocities = [1.12,1.15365,1.27265,1.477,1.7667,2.17694,1.73432,2.16208,2.26746,2.297,2.2507,2.12856,1.93059,1.65677,1.30711,1.06531,0.98175,0.8979,0.81376,0.72933,0.64461,0.5596,0.4743,0.38871,0.30284,0.21667,0.13021,0.04347,0,0,0,0,0,0,0];
actionStates[CHARIDS.FALCON_ID].TECHB.setVelocities = [0,0.18075,0.39766,0.39766,0.18075,-0.25305,-0.90377,-2.46367,-2.41059,-2.35439,-2.2951,-2.23269,-2.16718,-2.09857,-2.02684,-1.95201,-1.87408,-1.79303,-1.70888,-1.62163,-1.53127,-1.4378,-1.34122,-1.24154,-1.13876,-1.03285,-0.92387,-0.81175,-0.69653,-0.57822,-0.45678,-0.33226,-0.20461,-0.07387,0,0,0,0,0,0];
actionStates[CHARIDS.FALCON_ID].TECHF.setVelocities = [0,-0.75759,-1.12332,-1.01883,-0.44410,1.06591,2.27794,2.89521,3.22928,2.65097,1.77161,1.38143,1.26423,1.42003,1.84881,2.67623,3.28124,3.22766,2.51549,1.80722,1.57673,1.39843,1.27236,1.19849,1.17685,1.20741,1.14091,0.9545,0.78604,0.63551,0.50292,0.38828,0.29156,0.2128,-0.14317,-0.14317,-0.14318,-0.14317,-0.14317,-0.14317];
actionStates[CHARIDS.FALCON_ID].CLIFFCATCH.posOffset = [[-74.30689,-20.11477],[-73.95572,-20.50451],[-73.38841,-21.13325],[-72.74251,-21.82974],[-72.13988,-22.36620],[-71.53900,-23.01287],[-70.88926,-24.14437]];
actionStates[CHARIDS.FALCON_ID].CLIFFWAIT.posOffset = [-70.85271,-23.09623];
  