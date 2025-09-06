"use strict";
// import { drivers, fullRoster, weeklyLeave } from './data.js';
////////////////////////////// TEST //////////////////////////////////////
////////////////////////////// TEST //////////////////////////////////////

import DailySheet from "./dailySheetClass.js";

///////////////////////////// DOM ELEMENTS /////////////////////////////

const pad2digits = new Intl.NumberFormat("en-GB", {
  minimumIntegerDigits: 2,
});

const datePicker = document.querySelector("#datepicker");
const selectedDate = document.querySelector(".submit--date");
const allocateSparesCheckBox = document.querySelector('input[type="checkbox"]');
const dailySheetContent = document.querySelector(".dailysheet--content");
// const weeklyLeaveDate1 = document.querySelector(".weekly--leave-date--1");
// const weeklyLeaveDate2 = document.querySelector(".weekly--leave-date--2");
// a live HTMLCollection of all the weekly leave list elements
// const weeklyLeaveList = document.getElementsByClassName("weekly--leave-list");
const dailySheetDateHTML = document.querySelectorAll(".dailysheet--date");
const dailySheetDateBeforeHTML = document.querySelector(
  ".dailysheet--date--before"
);
const dailySheetDateAfterHTML = document.querySelector(
  ".dailysheet--date--after"
);
// a live node list
const weeklyLeaveContainer = document.getElementsByClassName(
  "weekly--leave-container"
);
const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const unavailableDriversHTML = [
  document.querySelector(".unavailable--list--1"),
  document.querySelector(".unavailable--list--2"),
  document.querySelector(".unavailable--list--3"),
];

/////////////////////////// GLOBAL VARIABLES ///////////////////////////
// can be set to weekleave1, unavailableDrivers1, unavailableDrivers2 or
// unavailableDrivers3 depending on which modal is open
let modalFlag;

/* 
const unavailableDrivers = {
  unavailableDrivers1: [],
  unavailableDrivers2: [],
  unavailableDrivers3: [],
}; */

// initialise unavailableDrivers arrays 1-3 representing previous day,
// current dailysheet date and next day, from initial unavailable drivers
// on web page. Note, these can be edited on the fly.

/* 
unavailableDriversHTML.forEach((list_element, i) => {
  for (const el of list_element.children) {
    unavailableDrivers[`unavailableDrivers${i + 1}`].push(el.textContent);
  }
});
 */

////////////////////////////// TEST //////////////////////////////////////

const prevDailySheetObj = new DailySheet();
const nextDailySheetObj = new DailySheet();
const currDailySheetObj = new DailySheet();

let startingUnavailableDrivers = [];

for (const el of document.querySelector(".unavailable--list--1").children)
  startingUnavailableDrivers.push(el.textContent);

console.log(`Starting unavailable drivers: ${startingUnavailableDrivers}\n`);
const initialiseAllUnavailableDrivers = () => {
  // initialise unavailableDrivers arrays for all 3 days, i.e. prev, curr, next
  // this function is also called, and the three arrays reinitialised, from the
  // calculateDailySheet function whenever a new date is selected
  // from the datepicker.

  if (currDailySheetObj.hasOwnProperty("unavailableDrivers")) {
    // if they exist on the object, clear contents of each array

    for (const dailySheetObj of [
      prevDailySheetObj,
      currDailySheetObj,
      nextDailySheetObj,
    ])
      dailySheetObj["unavailableDrivers"].length = 0;
  } else {
    // if this is the first time the function is called, dynamically
    // create unavailableDrivers array as a property on each object instance

    for (const dailySheetObj of [
      prevDailySheetObj,
      currDailySheetObj,
      nextDailySheetObj,
    ])
      dailySheetObj["unavailableDrivers"] = [];
  }

  // initialise or reinitialise unavailableDrivers arrays with
  // the startingUnavailableDrivers array
  for (const dailySheetObj of [
    prevDailySheetObj,
    currDailySheetObj,
    nextDailySheetObj,
  ]) {
    for (const driver of startingUnavailableDrivers)
      dailySheetObj["unavailableDrivers"].push(driver);
  }

  // update the unavailable drivers on the web page
  unavailableDriversHTML.forEach((list_element) => {
    // first, clear contents
    list_element.innerHTML = "";
    // reset to the starting list of unavailable drivers on web page
    for (const driver of startingUnavailableDrivers) {
      const html = `<li class="unavailable--item">${driver}</li> `;
      list_element.insertAdjacentHTML("beforeend", html);
    }
  });
};

////////////////////////////// TEST //////////////////////////////////////

///////////////////////////////////////////////////////////////////////
////////////////////////////// FUNCTIONS //////////////////////////////

// Converts a date object to a string and returns the date string in the
// form 'YYYY-MM-DD'. This is a string format that is used to set the
// value, min and max attributes in the html datepicker
const parseDateObjectToString = (dateOject, seperator = "-") => {
  const yyyy = `${dateOject.getUTCFullYear()}`;
  const mm = pad2digits.format(dateOject.getUTCMonth() + 1);
  const dd = pad2digits.format(dateOject.getUTCDate());
  return `${yyyy}${seperator}${mm}${seperator}${dd}`;
};

const setUpDatePicker = (daysAhead = 1) => {
  const min = new Date(Date.now()); // today's date
  const max = new Date(min); // create a copy
  // set 8 days ahead of current date
  min.setUTCDate(min.getUTCDate() + daysAhead);
  max.setUTCFullYear(max.getUTCFullYear(), 11, 31); // 31/12/2024
  const minDateStr = parseDateObjectToString(min);
  datePicker.value = minDateStr;
  datePicker.min = minDateStr;
  datePicker.max = parseDateObjectToString(max);
};

const grabDateFromDatePicker = () => {
  const chosenDate = datePicker.value;
  const [yyyy, mm, dd] = chosenDate.split("-");
  return new Date(Date.UTC(yyyy, mm - 1, dd));
};

const updateWeeklyLeaveDisplay = () => {
  // get weekly leave list HTML elements
  const weeklyLeaveList = document.querySelectorAll(".weekly--leave-list");
  const weeklyLeaveDate1 = document.querySelector(".weekly--leave-date--1");
  const weeklyLeaveDate2 = document.querySelector(".weekly--leave-date--2");

  // get current day of week
  const sunOrSat = currDailySheetObj.dailySheetDateObj.getUTCDay();

  // Clear all previous contents
  for (let i = 0; i < weeklyLeaveList.length; i++) {
    weeklyLeaveList[i].innerHTML = "";
  }

  ///////////////////////////// TEST //////////////////////////////
  const testFunction2 = () => {
    const updateDisplay = (nestedObj) => {
      /*       // Clear all previous contents
      for (let i = 0; i < weeklyLeaveList.length; i++) {
        weeklyLeaveList[i].innerHTML = "";
      } */

      // get weekly leave list HTML elements
      nestedObj.forEach((obj, i) => {
        [weeklyLeaveDate1, weeklyLeaveDate2][i].textContent =
          obj.weekCommencingDateStr;
        const arr = obj.weeklyLeaveArr;
        for (const drv of arr) {
          const html = `<li class="weekly--leave-item">${drv}</li>`;
          weeklyLeaveList[i].insertAdjacentHTML("beforeend", html);
        }
      });
    };

    const objectMap2 = {
      0: [prevDailySheetObj, currDailySheetObj],

      6: [currDailySheetObj, nextDailySheetObj],

      default: [currDailySheetObj],
    };

    const nestedObj = objectMap2[sunOrSat] ?? objectMap2.default;

    updateDisplay(nestedObj);
  };

  testFunction2();
  ///////////////////////////////////////////////////////////////////////

  /* 
  if (sunOrSat === 0) {
    // display the correct weekly leave date on the web page for slides 1 & 2
    weeklyLeaveDate1.textContent = prevDailySheetObj.weekCommencingDateStr;
    weeklyLeaveDate2.textContent = currDailySheetObj.weekCommencingDateStr;
    // Update display for slide 1 weekly leave
    prevDailySheetObj.weeklyLeaveArr.forEach((drv) => {
      const html = `<li class="weekly--leave-item">${drv}</li>`;
      weeklyLeaveList[0].insertAdjacentHTML("beforeend", html);
    });
    // Update display for slide 2 weekly leave
    currDailySheetObj.weeklyLeaveArr.forEach((drv) => {
      const html = `<li class="weekly--leave-item">${drv}</li>`;
      weeklyLeaveList[1].insertAdjacentHTML("beforeend", html);
    });
    return;
  }

  if (sunOrSat === 6) {
    // display the correct weekly leave date on the web page for slides 1 & 2
    weeklyLeaveDate1.textContent = currDailySheetObj.weekCommencingDateStr;
    weeklyLeaveDate2.textContent = nextDailySheetObj.weekCommencingDateStr;
    // Update display for slide 1 weekly leave
    currDailySheetObj.weeklyLeaveArr.forEach((drv) => {
      const html = `<li class="weekly--leave-item">${drv}</li>`;
      weeklyLeaveList[0].insertAdjacentHTML("beforeend", html);
    });
    // Update display for slide 2 weekly leave
    nextDailySheetObj.weeklyLeaveArr.forEach((drv) => {
      const html = `<li class="weekly--leave-item">${drv}</li>`;
      weeklyLeaveList[1].insertAdjacentHTML("beforeend", html);
    });
    return;
  }
  // In the event of mon to fri been the day of the current DailySheet
  // i.e. no 2 slide carousel for weekly leave
  // display the correct weekly leave date on the web page where the
  // carousel has not been created in the case of mon to fri senarios
  weeklyLeaveDate1.textContent = currDailySheetObj.weekCommencingDateStr;
  // Update display for weekly leave on web page
  currDailySheetObj.weeklyLeaveArr.forEach((drv) => {
    const html = `<li class="weekly--leave-item">${drv}</li>`;
    weeklyLeaveList[0].insertAdjacentHTML("beforeend", html);
  });
 */
};

/* 
const updateUnavailableDriversDisplay = (i) => {
  // Clear all previous contents
  // the function parameter i is used to determine which list to clear
  unavailableDriversHTML[i].innerHTML = "";

  // Add new contents to unavailable drivers on web page
  unavailableDrivers[`unavailableDrivers${[i + 1]}`].forEach((drv) => {
    const html = `<li class="unavailable--item">${drv}</li> `;
    unavailableDriversHTML[i].insertAdjacentHTML("beforeend", html);
  });
};
 */

////////////////////////// TEST //////////////////////////

const updateUnavailableDriversDisplay1 = () => {
  let i = +modalFlag.slice(-1) - 1;
  let unavailableDriversArrToUpdate = {
    unavailableDrivers1: prevDailySheetObj.unavailableDrivers,
    unavailableDrivers2: currDailySheetObj.unavailableDrivers,
    unavailableDrivers3: nextDailySheetObj.unavailableDrivers,
  }[modalFlag];

  // Clear all previous contents
  unavailableDriversHTML[i].innerHTML = "";

  // add new contents to the relevant unavailable drivers on web page
  unavailableDriversArrToUpdate.forEach((drv) => {
    const html = `<li class="unavailable--item">${drv}</li> `;
    unavailableDriversHTML[i].insertAdjacentHTML("beforeend", html);
  });
};

////////////////////////// TEST //////////////////////////

const displayDailySheet = (finalDailySheetObj) => {
  // Display the dailysheet date on web page (2 locations)
  // in the form 'DD/MM/YY'.
  for (const el of dailySheetDateHTML)
    el.textContent = `${DailySheet.dateGB.format(
      finalDailySheetObj.dailySheetDateObj
    )}`;

  // remove all previous rows, but not the header
  Array.from(dailySheetContent.children).forEach((el) => {
    if (el.classList.contains("dailysheet--item"))
      dailySheetContent.removeChild(el);
  });

  // Display daily sheet on web page
  finalDailySheetObj.revisedDailySheet.forEach(([driver, job]) => {
    const html = `
      <div class="dailysheet--item driver">${driver}</div>
      <div class="dailysheet--item bookon">${job.start.padStart(5, "0")}</div>
      <div class="dailysheet--item bookoff">${job.end.padStart(5, "0")}</div>
      <div class="dailysheet--item job">${job.job}</div>
    `;
    dailySheetContent.insertAdjacentHTML("beforeend", html);
  });
};

const displayExtraWeeklyLeaveSlide = function () {
  /*
   * Initialize variables to keep track of carousel state and
   * references to different elements.
   */
  let currentSlideIndex = 0;
  let slides, prevBtn, nextBtn;

  // Find what will be the slides container element in the DOM.
  const slidesContainer = document.querySelector(".weekly--leave-container");

  // If slides container element is not found, log an error and exit.
  if (!slidesContainer) {
    console.error("Specify a valid selector for the carousel.");
    return null;
  }

  // Add extra class to the slides container
  slidesContainer.classList.add("slide--container--extra");

  prevBtn = slidesContainer.querySelector(".slider__btn--left--extra");
  nextBtn = slidesContainer.querySelector(".slider__btn--right--extra");

  const weeklyLeaveTitleContainer1 = slidesContainer.querySelector(
    ".weekly--leave-title-container-1"
  );
  const weeklyLeaveList1 = slidesContainer.querySelector(
    ".weekly--leave-list--1"
  );

  const slide2 = slidesContainer.querySelector(".slide--2--extra");

  const addElement = (tag, attributes) => {
    const element = document.createElement(tag);

    if (attributes) {
      // Set attributes to the element.
      Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    }

    return element;
  };

  const tweakStructure = () => {
    // create a new slide element for weekly leave, this will be slide 1
    // of 2.
    const slide1 = addElement("div", {
      class: "slide--extra slide--1--extra",
    });
    // add slide one to the slides container as the first child
    slidesContainer.prepend(slide1);
    // move the weekly leave title container 1 and weekly leave list 1
    // inside slide 1 as it's child elements.
    slide1.append(weeklyLeaveTitleContainer1, weeklyLeaveList1);
    // reveal slide 2 and the button elements so as to add the finishing
    // touches to create a 2 slide carousel.
    slide2.classList.remove("weekly--leave-hidden");
    prevBtn.classList.remove("weekly--leave-hidden");
    nextBtn.classList.remove("weekly--leave-hidden");
    slides = slidesContainer.querySelectorAll(".slide--extra");
    /*
     * Move slides from the carousel element to the carousel inner
     * container to facilitate alignment.
     */
    slides.forEach((slide, index) => {
      slide.style.transform = `translateX(${index * 100}%)`;
    });
  };

  // Adjust slide positions according to the currently selected slide.
  const adjustSlidePosition = () => {
    slides.forEach((slide, i) => {
      slide.style.transform = `translateX(${100 * (i - currentSlideIndex)}%)`;
    });
  };

  // Move slide left and right based on direction provided.
  const moveSlide = (direction) => {
    const newSlideIndex =
      direction === "next"
        ? (currentSlideIndex + 1) % slides.length
        : (currentSlideIndex - 1 + slides.length) % slides.length;
    currentSlideIndex = newSlideIndex;
    adjustSlidePosition();
  };

  // Event handlers for previous and next button clicks.
  const handlePrevBtnClick = () => moveSlide("prev");
  const handleNextBtnClick = () => moveSlide("next");

  // Attach event listeners to relevant elements.
  const attachEventListeners = () => {
    prevBtn.addEventListener("click", handlePrevBtnClick);
    nextBtn.addEventListener("click", handleNextBtnClick);
  };

  // Initialize/create the carousel.
  const create = () => {
    tweakStructure();
    attachEventListeners();
  };

  // Destroy the carousel/clean-up.
  const destroy = () => {
    // Remove event listeners.
    prevBtn.removeEventListener("click", handlePrevBtnClick);
    nextBtn.removeEventListener("click", handleNextBtnClick);
    slidesContainer.prepend(weeklyLeaveTitleContainer1, weeklyLeaveList1);
    // weeklyLeaveTitleContainer1
    document.querySelector(".slide--1--extra").remove();
    prevBtn.classList.add("weekly--leave-hidden");
    nextBtn.classList.add("weekly--leave-hidden");
    slide2.classList.add("weekly--leave-hidden");
    slidesContainer.classList.remove("slide--container--extra");
  };

  // Return an object with methods to create and destroy the carousel.
  return { create, destroy };
};

const calculateDailySheet = function () {
  // get user selected date from datepicker on web page
  const dailySheetDate = grabDateFromDatePicker();

  // create daily sheet for selected date
  // dailysht.createDailySheet(dailySheetDate);

  ////////////////// TEST //////////////////////////////////////
  const prevDay = new Date(
    Date.UTC(
      dailySheetDate.getUTCFullYear(),
      dailySheetDate.getUTCMonth(),
      dailySheetDate.getUTCDate() - 1
    )
  );
  const nextDay = new Date(
    Date.UTC(
      dailySheetDate.getUTCFullYear(),
      dailySheetDate.getUTCMonth(),
      dailySheetDate.getUTCDate() + 1
    )
  );
  prevDailySheetObj.initialiseWeeklyLeave(prevDay);
  nextDailySheetObj.initialiseWeeklyLeave(nextDay);
  currDailySheetObj.initialiseWeeklyLeave(dailySheetDate);

  initialiseAllUnavailableDrivers();
  ////////////////////////////////////////////////////////////////

  ////////////////// TO BE IMPLEMENTED (START) /////////////////////

  // if Sunday or Saturday then display extra weekly leave slide
  const sunOrSat = currDailySheetObj.dailySheetDateObj.getUTCDay();
  if (sunOrSat === 0 || sunOrSat === 6) {
    if (weeklyLeaveContainer[0].classList.contains("slide--container--extra"))
      displayExtraWeeklyLeaveSlide().destroy();
    displayExtraWeeklyLeaveSlide().create();
  } else {
    if (weeklyLeaveContainer[0].classList.contains("slide--container--extra"))
      displayExtraWeeklyLeaveSlide().destroy();
  }

  ////////////////// TO BE IMPLEMENTED (END) ///////////////////

  // display date on web page for unavailable drivers list,
  // day before and after the current dailysheet date, i.e. slides 1 and 3
  dailySheetDateBeforeHTML.textContent = DailySheet.dateGB.format(
    prevDailySheetObj.dailySheetDateObj
  );
  dailySheetDateAfterHTML.textContent = DailySheet.dateGB.format(
    nextDailySheetObj.dailySheetDateObj
  );

  updateWeeklyLeaveDisplay();

  // amend daily sheet to reflect absent or unavailable drivers

  recalculateDailySheet1();

  /*   
  [prevDailySheetObj, nextDailySheetObj, currDailySheetObj].forEach(
    (dailySheetObj, i) => recalculateDailySheet(dailySheetObj, i)
  );
  */

  // display daily sheet on page
  // displayDailySheet(currDailySheetObj);
};

/////////////////////////// TEST ////////////////////////////

const recalculateDailySheet1 = function () {
  // amend daily sheet to reflect absent or unavailable drivers
  [prevDailySheetObj, nextDailySheetObj, currDailySheetObj].forEach(
    (dailySheetObj, i) => {
      dailySheetObj.createDailySheet();

      // combine the unavailable drivers and weekly leave arrays into a
      // new absentDrivers array which is the total list of absent drivers.
      let absentDrivers = [
        ...dailySheetObj.unavailableDrivers,
        ...dailySheetObj.weeklyLeaveArr,
      ];

      // remove duplicates where a driver is on both weekly leave and unavailable
      absentDrivers = [...new Set(absentDrivers)];

      console.log(
        `Absent Drivers: ${absentDrivers} for ${dailySheetObj.dailySheetDateObj}`
      );

      // amend daily sheet to reflect absent or unavailable drivers
      dailySheetObj.purgeDailySheet(absentDrivers);

      /////////////////// Test //////////////////////
      // if the allocate spares toggle switch is checked, as a further operation,
      // allocate spares for each of the corresponding daily sheets.
      // Futhermore, if the dailysheet is for the current day, pass in the
      // previous and next day daily sheets in order to check that no driver
      // breaks hidden 18 in allocating spares for the current dailysheet
      // i.e. 12 hour rest periods required between allocated shifts.
      if (allocateSparesCheckBox.checked) {
        i === 2
          ? dailySheetObj.allocateSpares(prevDailySheetObj, nextDailySheetObj)
          : dailySheetObj.allocateSpares();
      }
      ///////////////////////////////////////////////

      // display current amended daily sheet on page
      if (i === 2) displayDailySheet(dailySheetObj);
    }
  );
};

/////////////////////////// TEST ////////////////////////////

/* 
const recalculateDailySheet = function (dailySheetObj, i) {
  // if dailysheet does not exist yet return
  if (!dailySheetObj.dailySheet) return;

  let unavailableDrvArr;
  switch (i) {
    case 0:
      unavailableDrvArr = unavailableDrivers["unavailableDrivers1"];
      break;
    case 1:
      unavailableDrvArr = unavailableDrivers["unavailableDrivers3"];
      break;
    case 2:
      unavailableDrvArr = unavailableDrivers["unavailableDrivers2"];
      break;
  }

  // combine the unavailable drivers and weekly leave arrays into a
  // new absentDrivers array which is the total list of absent drivers.
  let absentDrivers = [...dailySheetObj.weeklyLeaveArr, ...unavailableDrvArr];

  // remove duplicates where a driver is on both weekly leave and unavailable
  absentDrivers = [...new Set(absentDrivers)];

  // amend daily sheet to reflect absent or unavailable drivers
  dailySheetObj.purgeDailySheet(absentDrivers);

  /////////////////// Test //////////////////////
  // if the allocate spares toggle switch is checked, as a further operation,
  // allocate spares for each of the corresponding daily sheets.
  // Futhermore, if the dailysheet is for the current day, pass in the
  // previous and next day daily sheets in order to check that no driver
  // breaks hidden 18 in allocating spares for the current dailysheet
  // i.e. 12 hour rest periods required between allocated shifts.
  if (allocateSparesCheckBox.checked) {
    i === 2
      ? dailySheetObj.allocateSpares(prevDailySheetObj, nextDailySheetObj)
      : dailySheetObj.allocateSpares();
  }
  ///////////////////////////////////////////////

  // display current amended daily sheet on page
  if (i === 2) displayDailySheet(dailySheetObj);
};
 */

const editUnavailableDrivers = function (event) {
  /*   
  // nested function to add or remove driver from the corresponding array
  // i.e. the weeklyLeaveArray or unavailableDrivers array
  // mutates the array passed by reference (so may not need to return drvArray)
  const addRemoveDriver = (drvArray) => {
    addOrRemove === "Add" &&
      !drvArray.includes(DriverToAddOrRemove) &&
      drvArray.push(DriverToAddOrRemove);

    if (addOrRemove === "Remove" && drvArray.includes(DriverToAddOrRemove)) {
      // remove driver from array
      drvArray.splice(drvArray.indexOf(DriverToAddOrRemove), 1);
      // the line below creates a new array whereas the above line mutates the
      // original array passed by reference.
      // drvArray = drvArray.filter((driver) => driver !== DriverToAddOrRemove);
    }
    // return the amended array, though since the array is passed by reference
    // it will be mutated anyway so may not need to return.
    // return drvArray;
  };
 */

  // if dailysheet does not exist yet return
  if (!currDailySheetObj.dailySheetDateObj) return;
  // grab add or remove from button depending on what was clicked
  const addOrRemove = event.target.textContent;
  // grab driver name from button depending on which driver row was clicked
  const DriverToAddOrRemove =
    event.target.closest("li").firstElementChild.textContent;
  const sunOrSat = currDailySheetObj.dailySheetDateObj.getUTCDay();

  ////////////////////////////// TEST START/////////////////////////////////

  const addRemoveDriver = (dailySheetNestedLeaveArr) => {
    // loop through the array of dailysheet weeklyleave or unavailabledrivers
    // arrays and add or remove driver
    for (const dailySheetLeaveArr of dailySheetNestedLeaveArr) {
      // if the driver is not already in the weeklyLeaveArr/unavailableDrivers
      // array and addOrRemove is 'Add', add the driver to the corresponding
      // dailysheet object's leave array. Note, this mutates the
      // object's weeklyleave/unavailableDrivers array.
      addOrRemove === "Add" &&
        !dailySheetLeaveArr.includes(DriverToAddOrRemove) &&
        dailySheetLeaveArr.push(DriverToAddOrRemove);

      // if the driver is already in the weeklyLeaveArr/unavailableDrivers
      // array and addOrRemove is 'Remove', add the driver to the corresponding
      // dailysheet object's leave array. Note, this mutates the
      // object's weeklyleave/unavailableDrivers array.

      if (
        addOrRemove === "Remove" &&
        dailySheetLeaveArr.includes(DriverToAddOrRemove)
      ) {
        // remove driver from array
        dailySheetLeaveArr.splice(
          dailySheetLeaveArr.indexOf(DriverToAddOrRemove),
          1
        );
      }
    }
  };

  ////////////////////////////// TEST END //////////////////////////////////

  /*   
  if (
    modalFlag === "unavailableDrivers1" ||
    modalFlag === "unavailableDrivers2" ||
    modalFlag === "unavailableDrivers3"
  ) {
    unavailableDrivers[modalFlag] = addRemoveDriver(
      unavailableDrivers[modalFlag]
    );

    // update list of unavailable drivers on web page
    // extract the end number from the modalFlag string and subtract 1
    // after converting it to a number. i.e. 'unavailableDrivers1' -> 0

    updateUnavailableDriversDisplay(+modalFlag.slice(-1) - 1);
    }

 */

  // if modalFlag is 'unavailableDrivers*', edit the unavailableDrivers array
  if (modalFlag.slice(0, -1) === "unavailableDrivers") {
    let driversObjToUpdate = {
      unavailableDrivers1: prevDailySheetObj,
      unavailableDrivers2: currDailySheetObj,
      unavailableDrivers3: nextDailySheetObj,
    }[modalFlag];

    addRemoveDriver([driversObjToUpdate.unavailableDrivers]);

    updateUnavailableDriversDisplay1();
  }
  /* 
    // update the relevant unavailable drivers array corresponding to
    // the list modified as indicated by the modalFlag
    let updateUnavailableDriverArr = {
      unavailableDrivers1() {
        prevDailySheetObj.unavailableDrivers = addRemoveDriver(
          prevDailySheetObj.unavailableDrivers
        );
      },
      unavailableDrivers2() {
        currDailySheetObj.unavailableDrivers = addRemoveDriver(
          currDailySheetObj.unavailableDrivers
        );
      },
      unavailableDrivers3() {
        nextDailySheetObj.unavailableDrivers = addRemoveDriver(
          nextDailySheetObj.unavailableDrivers
        );
      },
    };

    updateUnavailableDriverArr[modalFlag]();
 */

  ////////////////////////////// TEST START/////////////////////////////////
  /////////////////////////// IN PLACE OF BELOW ////////////////////////////
  const testFunction = () => {
    const objectMap = {
      0: {
        weeklyleave1: [prevDailySheetObj.weeklyLeaveArr],
        weeklyleave2: [
          currDailySheetObj.weeklyLeaveArr,
          nextDailySheetObj.weeklyLeaveArr,
        ],
      },
      6: {
        weeklyleave1: [
          prevDailySheetObj.weeklyLeaveArr,
          currDailySheetObj.weeklyLeaveArr,
        ],
        weeklyleave2: [nextDailySheetObj.weeklyLeaveArr],
      },
      default: [
        prevDailySheetObj.weeklyLeaveArr,
        currDailySheetObj.weeklyLeaveArr,
        nextDailySheetObj.weeklyLeaveArr,
      ],
    };

    const dailySheetNestedLeaveArray =
      objectMap[sunOrSat]?.[modalFlag] ?? objectMap.default;

    addRemoveDriver(dailySheetNestedLeaveArray);
    updateWeeklyLeaveDisplay();
  };

  if (modalFlag.slice(0, -1) === "weeklyleave") {
    testFunction();
  }

  ////////////////////////////// TEST END //////////////////////////////////

  /* 
  // Alternatively, if modalFlag is 'weekly', edit the weeklyLeave drivers
  if (modalFlag === "weeklyleave2") {
    if (sunOrSat === 6) addRemoveDriver(nextDailySheetObj.weeklyLeaveArr);
    else {
      addRemoveDriver(currDailySheetObj.weeklyLeaveArr);
      addRemoveDriver(nextDailySheetObj.weeklyLeaveArr);
    }
    // update list of those drivers on weekly leave on web page
    updateWeeklyLeaveDisplay();
  } else if (modalFlag === "weeklyleave1") {
    if (sunOrSat === 0) addRemoveDriver(prevDailySheetObj.weeklyLeaveArr);
    else if (sunOrSat === 6) {
      addRemoveDriver(prevDailySheetObj.weeklyLeaveArr);
      addRemoveDriver(currDailySheetObj.weeklyLeaveArr);
    } else {
      addRemoveDriver(currDailySheetObj.weeklyLeaveArr);
      addRemoveDriver(prevDailySheetObj.weeklyLeaveArr);
      addRemoveDriver(nextDailySheetObj.weeklyLeaveArr);
    }
    // update list of those drivers on weekly leave on web page
    updateWeeklyLeaveDisplay();
  }
 */

  // re-calculate daily sheet if there are more than 7 rows
  // i.e. more than just the header elements
  if (dailySheetContent.childElementCount > 7) recalculateDailySheet1();
};

/////////////////////////// EVENT LISTENERS ///////////////////////////

setUpDatePicker();

const openModal = function (e) {
  e.preventDefault();
  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
};

const closeModal = function () {
  modal.classList.add("hidden");
  overlay.classList.add("hidden");
};

document.addEventListener("click", (event) => {
  // if the user clicks on the show modal button for adding or removing
  // unvailable drivers, open the modal and set modalFlag accordingly
  if (event.target.closest('button[data-target="unavailable"]') !== null) {
    if (event.target.closest(".slide--1")) modalFlag = "unavailableDrivers1";
    if (event.target.closest(".slide--2")) modalFlag = "unavailableDrivers2";
    if (event.target.closest(".slide--3")) modalFlag = "unavailableDrivers3";

    openModal(event);
  }
  // if the user clicks on the show modal button for adding or removing
  // drivers on weekly leave, open the modal and set modalFlag accordingly
  if (event.target.closest('button[data-target="weekly-leave"]') !== null) {
    if (event.target.closest(".slide--2--extra")) modalFlag = "weeklyleave2";
    else modalFlag = "weeklyleave1";
    openModal(event);
  }

  // if the user clicks on the 'X' button in the modal, close the modal
  if (event.target.closest(".close-modal")) closeModal(event);

  // if the modal is open, and the user clicks on a 'Add' or
  // 'Remove' button in the modal, edit the unavailableDrivers array
  // accordingly and display the results. Also, re-calculate the daily sheet.
  if (
    !modal.classList.contains("hidden") &&
    event.target.closest(".driver--list-modal button")
  )
    editUnavailableDrivers(event);

  if (event.target === allocateSparesCheckBox) {
    if (dailySheetContent.childElementCount > 7) recalculateDailySheet1();
    else allocateSparesCheckBox.checked = false;
  }

  // the final possibility is that the user submits a new date in the
  // date picker, if so, calculate the daily sheet for the new date
  //  and display the results, otherwise return and do nothing.
  if (event.target !== selectedDate) return;

  // if the user clicks on the date in the date picker, calculate the daily sheet
  calculateDailySheet();
});

// if the modal is open and the user presses the 'Escape' key,
// also close the modal.
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) {
    closeModal();
  }
});

///////////////////////////////////////
// Slider
const slider = function () {
  const slides = document.querySelectorAll(".slide");
  const btnRight = document.querySelector(".slider__btn--right");
  const btnLeft = document.querySelector(".slider__btn--left");

  let curSlide = 0;
  const maxSlide = slides.length;

  // Functions
  const goToSlide = function (slide) {
    slides.forEach(
      (s, i) => (s.style.transform = `translateX(${100 * (i - slide)}%)`)
    );
  };

  // Next slide
  const nextSlide = function () {
    if (+curSlide === maxSlide - 1) curSlide = 0;
    else curSlide++;

    goToSlide(curSlide);
  };

  const prevSlide = function () {
    if (+curSlide === 0) curSlide = maxSlide - 1;
    else curSlide--;

    goToSlide(curSlide);
  };

  const init = function () {
    // initial setup
    goToSlide(1);
  };

  init();

  // Event handlers
  btnLeft.addEventListener("click", prevSlide);
  btnRight.addEventListener("click", nextSlide);

  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") prevSlide();
    e.key === "ArrowRight" && nextSlide();
  });
};

slider();
