'use strict';

const fs = require('fs');
const XLSX = require('xlsx');

const wb = XLSX.readFile('./CUD_WL_2025.xlsx', {
  type: 'binary',
  cellNF: true,
  cellDates: true,
  dateNF: 'dd/mm/yy',
});
const ws = wb.Sheets[wb.SheetNames[0]];
const json = XLSX.utils.sheet_to_json(ws, {
  header: 1,
  raw: false,
});

const weeklyLeaveObj = {};
const weeklyLeaveArr = json.slice(4, -2);
// console.log(weeklyLeaveArr);
weeklyLeaveArr.forEach(el => {
  let tempArr = [];
  for (let i = 0; i < el.length; i++) {
    i >= 2 && i <= 5 && el[i] && tempArr.push(el[i]);
  }
  weeklyLeaveObj[el[0]] = tempArr;
});

// console.log(weeklyLeaveObj);

fs.writeFile(
  'weeklyleave.json',
  JSON.stringify(weeklyLeaveObj, null, 2),
  err => {
    // Checking for errors
    if (err) throw err;

    // Success
    console.log('Done writing');
  }
);
