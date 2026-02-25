'use strict';
////////////////////////////// TEST //////////////////////////////////////
import { drivers, fullRoster, linkStartDate } from './data.js';
import UnavailableDrivers from './unavailableDriversClass.js';
////////////////////////////// TEST //////////////////////////////////////

class DailySheet {
  static MillisecsToMins = 60 * 1000;
  static unrotatedDriversArr = [];
  static roster = [];
  /*   constructor(unrotatedDriversArr, roster) {
    DailySheet.unrotatedDriversArr = unrotatedDriversArr;
    DailySheet.roster = roster;
  } */
  ////////////////////////////// TEST //////////////////////////////////////
  constructor() {
    DailySheet.unrotatedDriversArr = drivers;
    DailySheet.roster = fullRoster;
  }
  ////////////////////////////// TEST //////////////////////////////////////
  rotateArray(arr, dateObjToRotateBy) {
    arr = arr.slice();
    // dateObjToRotateBy = new Date(dateObjToRotateBy);

    const linkStartDateObj = DailySheet.parseStrToDate(linkStartDate);

    let k =
      (dateObjToRotateBy - linkStartDateObj) / (1000 * 3600 * 24 * 7);

    k = k % arr.length; // In case k is larger than array length
    return arr.slice(-k).concat(arr.slice(0, -k));
  }

  initialiseWeeklyLeave(dailySheetDateObj) {
    this.dailySheetDateObj = dailySheetDateObj;
    this.weekCommencingDateObj = DailySheet.getWeekCommencing(
      this.dailySheetDateObj,
    );

    //////////////  TEST  //////////////////
    // Get week commencing date in string format 'dd/mm/yy'
    this.weekCommencingDateStr = DailySheet.dateGB.format(
      this.weekCommencingDateObj,
    );

    this.weeklyLeaveArr = new UnavailableDrivers(
      this.weekCommencingDateStr,
    ).weeklyLeaveArray;
    //////////////  TEST  //////////////////
  }

  createDailySheet() {
    // this.dailySheetDateObj = dailySheetDateObj;
    // this.weekCommencingDateObj = DailySheet.getWeekCommencing(
    //   this.dailySheetDateObj
    // );

    this.rotatedDriversArr = this.rotateArray(
      DailySheet.unrotatedDriversArr,
      this.weekCommencingDateObj,
    );

    const index = this.dailySheetDateObj.getUTCDay();
    this.dailySheet = DailySheet.roster
      .map((row, i) => [this.rotatedDriversArr[i], row[index]])
      .filter(el => el[1] !== 'RD');

    //////////////  TEST  //////////////////

    // clone each job object of dailysheet so that the original job object in
    // DailySheet.roster (i.e. fullRoster) is unchanged
    this.dailySheet = this.dailySheet.map(row => [
      row[0],
      row[1].clone(),
    ]);

    //////////////  TEST  //////////////////

    this.dailySheet.forEach(row =>
      row[1].setStartDate(this.dailySheetDateObj),
    );
    this.dailySheet.sort(this.#compareFn);

    //////////////  TEST  //////////////////
    console.log(`Create DailySheet for ${this.dailySheetDateObj}:\n`);
    for (const [driv, job] of this.dailySheet)
      console.log(`${driv} => ${job.start} - ${job.end}, ${job.job}`);
    console.log('\n');
    //////////////  TEST  //////////////////
  }

  // purge daily sheet by creating uncovered jobs and removing spares belonging to thoses drivers from weekly leave
  purgeDailySheet(absentDrivers) {
    this.revisedDailySheet = [];

    /*     for (let i = 0; i < this.dailySheet.length; i++) {
      let [drv, jb] = this.dailySheet[i];
      if (absentDrivers.some((driver) => drv.includes(driver))) {
        if (jb.job.startsWith("CU") && !drv.startsWith("UNCOVERED"))
          drv = `UNCOVERED (${drv})`;
        else if (jb.job.startsWith("SP") || jb.job.startsWith("RR")) continue;
      } else if (drv.startsWith("UNCOVERED")) {
        drv = drv.split("(")[1].slice(0, -1);
      }
      this.revisedDailySheet.push([drv, jb]);
    } */

    //////////////  TEST  //////////////////
    for (let i = 0; i < this.dailySheet.length; i++) {
      let [drv, jb] = this.dailySheet[i];
      if (absentDrivers.some(driver => driver === drv)) {
        if (jb.job.startsWith('CU')) drv = `UNCOVERED (${drv})`;
        else if (jb.job.startsWith('SP') || jb.job.startsWith('RR'))
          continue;
      }
      this.revisedDailySheet.push([drv, jb]);
    }
    ////////////////  TEST  //////////////////

    //////////////  TEST  //////////////////
    console.log(`Purge DailySheet for ${this.dailySheetDateObj}:\n`);
    for (const [driv, job] of this.revisedDailySheet)
      console.log(`${driv} => ${job.start} - ${job.end}, ${job.job}`);
    console.log('\n');
    //////////////  TEST  //////////////////
  }

  #compareFn = (a, b) => {
    // Split the time strings into hours and minutes
    const [hourA, minA] = a[1].start.split(':');
    const [hourB, minB] = b[1].start.split(':');
    // Convert hours and minutes to numbers
    const timeInMinutesA = parseInt(hourA) * 60 + parseInt(minA);
    const timeInMinutesB = parseInt(hourB) * 60 + parseInt(minB);
    // If times are equal, sort based on job i.e. SP first
    if (timeInMinutesA === timeInMinutesB && a[1].job === 'SP')
      return -1;
    if (timeInMinutesA === timeInMinutesB && b[1].job === 'SP')
      return 1;
    // Sort based on time in minutes
    return timeInMinutesA - timeInMinutesB;
  };

  allocateSpares(prevDS, nextDS) {
    const hidden18Check = function (
      spareDriver,
      uncvrJobObj,
      prevDaily,
      nextDaily,
    ) {
      const [drvBefore, prevjob] = prevDaily.revisedDailySheet.find(
        row => row[0].includes(spareDriver),
      ) ?? [null, null];
      const [drvAfter, nextjob] = nextDaily.revisedDailySheet.find(
        row => row[0].includes(spareDriver),
      ) ?? [null, null];

      const diffBefore =
        drvBefore &&
        Math.abs(
          (uncvrJobObj.startDate - prevjob.endDate) /
            DailySheet.MillisecsToMins,
        );

      const passOrFailBefore = !diffBefore || diffBefore >= 720;

      const diffAfter =
        drvAfter &&
        Math.abs(
          (nextjob.startDate - uncvrJobObj.endDate) /
            DailySheet.MillisecsToMins,
        );

      const passOrFailAfter = !diffAfter || diffAfter >= 720;

      const message1 = drvBefore
        ? `${drvBefore} => ${prevjob.start} - ${prevjob.end}, ${
            prevjob.job
          } has ${diffBefore} proposed mins rest between shifts, therefore ${
            passOrFailBefore ? 'PASSES' : 'FAILS'
          } the hidden 18 check.`
        : 'Driver not found';
      console.log(message1);

      const message2 = drvAfter
        ? `${drvAfter} => ${nextjob.start} - ${nextjob.end}, ${
            nextjob.job
          } has ${diffAfter} proposed mins rest between shifts, therefore ${
            passOrFailAfter ? 'PASSES' : 'FAILS'
          } the hidden 18 check.`
        : 'Driver not found';
      console.log(message2);

      return passOrFailBefore && passOrFailAfter;
    };

    // nearestOverall has to be declared outside the do while loop in
    // order to be able to reference it inside the loop.
    let nearestOverall;
    // keep looping until all uncovered jobs that can be covered, have
    // been covered.
    do {
      // reset nearestOverall on each new iteration of the do while loop
      nearestOverall = [];
      // extract spares and uncovered jobs into this.sparesArr and
      // this.uncoveredJobsArr, both arrays are in the form
      // [[driver, jobObj],[driver, jobObj]...[]].
      const { sparesArr, uncoveredJobsArr } =
        this.#extractSparesAndUncoveredJobs();

      uncoveredJobsArr.forEach(currUncoveredJob => {
        let [currUncoveredDriver, currUncoveredJobObj] =
          currUncoveredJob;

        // find nearest spare for each uncovered job
        let nearestSpare = sparesArr.reduce(
          (nearestSpareOverall, currNearestSpare) => {
            const [currNearestSpareDrv, currNearestSpareJob] =
              currNearestSpare;

            //////////////// Not yet Implemented //////////////////
            // perform hidden 18 check here, need currUncoveredJobObj and
            // currNearestSpareDrv as well as dailysheet with allocated spares
            // for days +1 and days -1. If hidden 18 is not met, return
            // nearestSpareOverall here.

            prevDS && nextDS
              ? console.log(
                  `Performing Hidden 18 check on ${currNearestSpareDrv}. Uncovered job is: ${currUncoveredJobObj.start} - ${currUncoveredJobObj.end} to ${currUncoveredJobObj.job}`,
                )
              : console.log(
                  'The Dailysheets for the previous and next day are not provided, therefore, Hidden 18 check on the currNearestSpareDrv will not be performed',
                );
            /*
            // this will be true, and only false if the hidden 18 check fails.
            let hidden18CheckTrueOrFalse = true;
            
            if (prevDS && nextDS) {
              hidden18CheckTrueOrFalse = hidden18Check(
                currNearestSpareDrv,
                currUncoveredJobObj,
                prevDS,
                nextDS
              );
            }
             */
            //////////////// Not yet Implemented //////////////////

            if (nearestSpareOverall === null) {
              let diff = Math.abs(
                (currUncoveredJobObj.startDate -
                  currNearestSpareJob.startDate) /
                  DailySheet.MillisecsToMins,
              );

              nearestSpareOverall = !(diff <= 180)
                ? nearestSpareOverall
                : !(prevDS && nextDS)
                  ? [diff, currNearestSpareDrv]
                  : hidden18Check(
                        currNearestSpareDrv,
                        currUncoveredJobObj,
                        prevDS,
                        nextDS,
                      )
                    ? [diff, currNearestSpareDrv]
                    : nearestSpareOverall;

              console.log(
                `nearestSpareOverall1: ${nearestSpareOverall}, diff: ${diff}`,
              );
            } else {
              const [diff1, driver] = nearestSpareOverall;
              const diff2 = Math.abs(
                (currUncoveredJobObj.startDate -
                  currNearestSpareJob.startDate) /
                  DailySheet.MillisecsToMins,
              );

              nearestSpareOverall = !(diff2 < diff1 && diff2 <= 180)
                ? [diff1, driver]
                : !(prevDS && nextDS)
                  ? [diff2, currNearestSpareDrv]
                  : hidden18Check(
                        currNearestSpareDrv,
                        currUncoveredJobObj,
                        prevDS,
                        nextDS,
                      )
                    ? [diff2, currNearestSpareDrv]
                    : [diff1, driver];

              console.log(
                `nearestSpareOverall2: ${nearestSpareOverall}, diff1: ${diff1}, diff2: ${diff2}`,
              );
            }

            return nearestSpareOverall;
          },
          null,
        );
        /*    
      nearestOverall is an array in the form [[uncoveredDriver1, diff1, nearestSpareDriver], [uncoveredDriver2, diff2, nearestSpareDriver]...[]].
      If there are no nearest spares, i.e. nearestSpare is empty, then
      do not add currUncoveredDriver to nearestOverall, in this case, the
      uncovered job cannot be covered by a spare driver.
      */

        console.log(
          `currentUncoveredDriver: ${currUncoveredDriver} nearestSpare: ${nearestSpare}`,
        );

        // So long as there is a nearest spare, add it to nearestOverall
        if (nearestSpare !== null)
          nearestOverall.push([currUncoveredDriver, ...nearestSpare]);

        console.log(`nearestOverall: ${nearestOverall}`);
      });

      // Providing the nearestOverall array is not empty, i.e. there are
      // spare drivers that can cover the uncovered job, reduce the
      //  nearestOverall array to find the nearest spare driver overall.
      if (nearestOverall.length !== 0) {
        const nearestSpareDrv = nearestOverall.reduce((acc, curr) => {
          const [, diff1] = acc;
          const [, diff2] = curr;

          return diff1 <= diff2 ? acc : curr;
        });

        this.#allocateSpareDriverToUncoveredJob(nearestSpareDrv);
      }

      console.log(nearestOverall);
    } while (nearestOverall.length !== 0);
  }

  #extractSparesAndUncoveredJobs() {
    // filter out all rows that are not spares
    const sparesArr = this.revisedDailySheet.filter(
      row => row[1].job === 'SP',
    );
    // filter out all rows that are not uncovered jobs
    const uncoveredJobsArr = this.revisedDailySheet.filter(row =>
      row[0].includes('UNCOVERED'),
    );
    return { sparesArr, uncoveredJobsArr };
  }

  #allocateSpareDriverToUncoveredJob([uncoveredDrv, , nearestSpDrv]) {
    this.revisedDailySheet = this.revisedDailySheet
      .map(row =>
        row[0] === uncoveredDrv ? [`* ${nearestSpDrv}`, row[1]] : row,
      )
      .filter(row => row[0] !== nearestSpDrv);
  }

  // Parse a date string of the form 'DD/MM/YYYY' to a Date object
  static parseStrToDate(dateStr) {
    const [day, month, year] = dateStr
      .split('/')
      .map(n => parseInt(n));
    return new Date(Date.UTC(year, month - 1, day));
  }

  static getWeekCommencing(dateObj) {
    dateObj = new Date(dateObj); // clone dateObj
    const i = dateObj.getUTCDay();
    dateObj.setUTCDate(dateObj.getUTCDate() - i);
    return dateObj;
  }

  // Convert date object to a string in the form 'DD/MM/YY'
  // const weekCommencingDateStr = Dailysheet.dateGB.format(weekCommencingDateObj);
  static dateGB = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'numeric',
    year: '2-digit',
  });
}

export default DailySheet;
