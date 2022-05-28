// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

const questionsPerCategory = 5;
const categoriesAcross = 6;
let categories = [];
let rootURL = "https://jservice.io/api/";

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
  let randomCategories = await axios.get("https://jservice.io/api/categories", {
    params: { count: 100 },
  });

  let categoryIds = randomCategories.data.map((result) => result.id);
  //return a random sample from the [id's] use below (array, #ofELementstoSample)

  return _.sampleSize(categoryIds, categoriesAcross);
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
  let response = await axios.get(`${rootURL}category?id=${catId}`);

  let allClues = response.data.clues;
  let randomClues = _.sampleSize(allClues, questionsPerCategory);
  // return a copy of the sample clues [{}]

  let clues = randomClues.map((clue) => ({
    question: clue.question,
    answer: clue.answer,
    showing: null,
  }));

  return { title: response.data.title, clues };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 *
 */

async function fillTable() {
  let jepTable = $('<table id="jeopardy">');
  let jepHead = $("<thead id='header'>");
  let jepBody = $("<tbody id ='tbody'>");
  let tr = $("<tr>");

  //loops through categories total (width) and add th for each category
  //appends tr to head and head to table

  for (let catIdx = 0; catIdx < categoriesAcross; catIdx++) {
    tr.append($("<th>").text(categories[catIdx].title.toUpperCase()));
  }
  jepHead.append(tr);
  jepTable.append(jepHead);

  //loop through questions/ height and add a table row
  for (let clueIdx = 0; clueIdx < questionsPerCategory; clueIdx++) {
    let $tr = $("<tr>");

    //loop through ccategories
    for (let catIdx = 0; catIdx < categoriesAcross; catIdx++) {
      // add td with the column-row index. Add "question" to inital board display
      $tr.append($("<td>").attr("id", `${catIdx}-${clueIdx}`).text("Question"));
    }
    jepBody.append($tr);
    jepTable.append(jepBody);
    $("body").append(jepTable);
    hideLoadingView();
  }
}
/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(e) {
  // e.preventDefault();
  let target = e.target.id;

  let [catId, clueId] = target.split("-");
  //split method: ordered list of substrings, adds into an array,returns that array. Syntax: (seperator, limit)
  let clue = categories[catId].clues[clueId];

  let message;

  //change message based on .showing from null(inital value) -> question -> answer -> no further action allowed to change message rendered
  if (!clue.showing) {
    message = clue.question;
    clue.showing = "question";
  } else if (clue.showing === "question") {
    message = clue.answer;
    clue.showing = "answer";
  } else {
    return;
  }
  // based on the column-row index display message on respective td
  $(`#${catId}-${clueId}`).html(message);
}

function showLoadingView() {
  $("body").append($("<h2 id= 'loading'> Loading... </h2>"));
}

/** Remove the loading spinner and update the button used to fetch data. */
function hideLoadingView() {
  $("h2").empty();
}

async function setupAndStart() {
  showLoadingView();

  let catIds = await getCategoryIds();

  categories = [];

  for (let catId of catIds) {
    categories.push(await getCategory(catId));
  }

  fillTable();
  $("#jeopardy").on("click", "td", handleClick);
}

/** On click of start / restart button, set up game. */

let startButton = $("<button id='restart'></button");
startButton.text("Start Game");

startButton.on("click", clearBoard);

function clearBoard() {
  $("table").remove();
  setupAndStart();
}

$("body").append(startButton);

// $(async function () {
//   setupAndStart();
// });
