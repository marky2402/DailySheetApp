'use strict';

import weeklyLeave from './weeklyleave.json' with { type: 'json' };
// import { weeklyLeave } from './data.js';

class UnavailableDrivers {
  constructor(weekCommencingStr) {
    // weekCommencingStr needs to be in the format 'dd/mm/yy'
    this.weekCommencingStr = weekCommencingStr;
  }

  get weeklyLeaveArray() {
    if (this.weekCommencingStr in weeklyLeave)
      // Reformat drivers names i.e. convert from S Perry to PERRY.
      return weeklyLeave[this.weekCommencingStr]
        .map(el => el.split(' ')[1].toUpperCase())
        .map(drv =>
          drv === 'PIPER' || drv === 'REYNOLDS'
            ? "REY'DS/PIPER"
            : drv,
        );
    else
      throw new Error(
        `Invalid week commencing date: ${this.weekCommencingStr}`,
      );
  }
}

// let weeklyLeaveArr = new UnavailableDrivers("14/09/24").weeklyLeaveArray;
// console.log(weeklyLeaveArr);

export default UnavailableDrivers;
