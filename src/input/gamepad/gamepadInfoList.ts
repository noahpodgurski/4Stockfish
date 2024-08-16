// @flow

/*eslint indent:0*/
/*eslint camelcase:0*/

import {mayflash} from "./gamepads/mayflash";
import {vjoy} from "./gamepads/vjoy";
import {raphnetV2_9, raphnetV3_2} from "./gamepads/raphnet";
import {xbox} from "./gamepads/xbox";
import {tigergame1, tigergame2} from "./gamepads/tigergame";
import {retrolink} from "./gamepads/retrolink";
import {brook} from "./gamepads/brook";
import {ps4} from "./gamepads/ps4";
import {rockx360} from "./gamepads/rockx360";
import {wiiU} from "./gamepads/wiiU";
import {betop} from "./gamepads/betop";
import {dualAction} from "./gamepads/dualAction";

export const gamepadInfoList = [ mayflash, vjoy, raphnetV2_9, raphnetV3_2, xbox, tigergame1, tigergame2
                               , retrolink, brook, ps4, rockx360, wiiU, betop, dualAction 
                               ];