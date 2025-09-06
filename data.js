'use strict';
// import data from './data.json';
import data from './data.json' with { type: 'json' };
import weeklyLeave from './weeklyleave.json' with { type: 'json' };

// console.log(data);

const {linkStartDate, drivers, roster} = data;
const jobArray = [];
const fullRoster = [];

class Job {
  constructor(start, end, job) {
    this.start = start;
    this.end = end;
    this.job = job;
    this.startDate = this.setStartTime(start);
    this.endDate = this.setEndTime(end);
  }

  parseTime(timeString) {
    const [hours, minutes] = timeString.split(":").map((n) => parseInt(n));
    return { hours, minutes };
  }

  setStartTime(hhmm) {
    const { hours, minutes } = this.parseTime(hhmm);
    return new Date(
      Date.UTC(
        this.startDate?.getUTCFullYear() ?? 0,
        this.startDate?.getUTCMonth() ?? 0,
        this.startDate?.getUTCDate() ?? 0,
        hours,
        minutes
      )
    );
  }

  setEndTime(hhmm) {
    const { hours, minutes } = this.parseTime(hhmm);
    return new Date(
      Date.UTC(
        this.endDate?.getUTCFullYear() ?? 0,
        this.endDate?.getUTCMonth() ?? 0,
        this.endDate?.getUTCDate() ?? 0,
        hours,
        minutes
      )
    );
  }

  setStartDate(date) {
    this.startDate.setUTCFullYear(date.getUTCFullYear()),
      this.startDate.setUTCMonth(date.getUTCMonth()),
      this.startDate.setUTCDate(date.getUTCDate());
    this._setEndDate();
  }

  _setEndDate() {
    const [h1,] = this.start.split(":");
    const [h2,] = this.end.split(":");
    let n = h1 - h2 > 0 ? 1 : 0;
    this.endDate.setUTCFullYear(
      this.startDate.getUTCFullYear(),
      this.startDate.getUTCMonth(),
      this.startDate.getUTCDate() + n
    );
  }

  clone() {
    return new Job(this.start, this.end, this.job);
  }

  static jobAlreadyExists(start, end, job) {
    return jobArray.some((jobInArray) => {
      return (
        jobInArray.start === start &&
        jobInArray.end === end &&
        jobInArray.job === job
      );
    });
  }
}

roster.forEach((row) => {
  row.forEach((cell, i) => {
    if (cell === "RD" || !cell) return;
    if (
      cell.startsWith("CU") &&
      !Job.jobAlreadyExists(
        row[i - 2].padStart(5, "0"),
        row[i - 1].padStart(5, "0"),
        cell
      )
    ) {
      jobArray.push(
        new Job(row[i - 2].padStart(5, "0"), row[i - 1].padStart(5, "0"), cell)
      );
    }
  });
});

// sort by job number
jobArray.sort((a, b) => a.job.slice(4) - b.job.slice(4));

// discard the top two rows
roster.slice(2).forEach((row) => {
  const week = [];

  row.forEach((cell, i) => {
    if (!cell) return;
    if (cell === "RD") week.push(cell);
    if (
      cell.startsWith("CU") ||
      cell.startsWith("SP") ||
      cell.startsWith("RR")
    ) {
      week.push(new Job(row[i - 2], row[i - 1], cell));
    }
  });

  fullRoster.push(week);
});

// console.log(jobArray);
// console.log(fullRoster);
// console.log(weeklyLeave);

export { drivers, fullRoster, linkStartDate, weeklyLeave };
