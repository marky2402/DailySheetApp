'use strict';

let selectedFile;

const JSONToFile = (obj, filename) => {
  const blob = new Blob([JSON.stringify(obj, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// Get the selected file when input changes
document
  .getElementById('myFile')
  .addEventListener('change', event => {
    selectedFile = event.target.files[0];
  });

// Handle upload button click
document.getElementById('upload-btn').addEventListener('click', e => {
  e.preventDefault();
  let fileReader = new FileReader();

  // Read the selected file as binary string
  fileReader.readAsArrayBuffer(selectedFile);

  // Process the file data when it's loaded
  fileReader.onload = event => {
    let fileData = event.target.result;

    // Read the Excel workbook
    let workbook = XLSX.read(fileData, {
      type: 'binary',
      cellNF: true,
      cellDates: true,
      dateNF: 'dd/mm/yy',
    });

    /* get first worksheet */
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

    XLSX.utils.sheet_add_aoa(
      firstSheet,
      [
        [
          'Sunday',
          'Sunday',
          'Sunday',
          ,
          'Monday',
          'Monday',
          'Monday',
          ,
          'Tuesday',
          'Tuesday',
          'Tuesday',
          ,
          'Wednesday',
          'Wednesday',
          'Wednesday',
          ,
          'Thursday',
          'Thursday',
          'Thursday',
          ,
          'Friday',
          'Friday',
          'Friday',
          ,
          'Saturday',
          'Saturday',
          'Saturday',
        ],
      ],
      {
        origin: 'F6',
      }
    );

    /* set cell F8 number format */

    console.log(firstSheet['AB4'].v);
    console.log(firstSheet['AB4'].v.toISOString());
    const linkStartDate = firstSheet['AB4'].v.toLocaleDateString();
    console.log(linkStartDate);
    // firstSheet["F8"].z = "hh:mm";
    console.log(firstSheet['F8']);

    /* header: 1 generates an array of arrays instead of a json object */
    /* raw: false makes use of formating data contained in each cell 
    i.e. to represent data as dates for example */
    const result = XLSX.utils.sheet_to_json(firstSheet, {
      header: 1,
      raw: false,
    });

    // const roster = result;
    // cut off top and bottom rows
    const roster = result.slice(5, -1);

    console.log(roster);

    // Replace cells with empty values or 'RD' with null
    const rosterWithNulls = roster.map(row => {
      return row.map(cell => (cell === 'RD' || !cell ? null : cell));
    });

    console.log(rosterWithNulls);

    const drivers = [];
    roster.slice(2).forEach(row => drivers.push(row[0]));

    let jsonData = {
      linkStartDate,
      drivers,
      roster,
      // roster: rosterWithNulls,
    };

    console.log(jsonData);

    // downloads the object as 'data.json'
    JSONToFile(jsonData, 'data');
  };
});
