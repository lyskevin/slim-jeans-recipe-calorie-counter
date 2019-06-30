var numberOfRows = 1; // current number of rows
var ingredients = {};
var weightConversionUnits = {
  "milligrams": 0.001,
  "grams": 1.0,
  "kilograms": 1000.0,
  "ounces": 28.3495,
  "pounds": 453.592
};
var volumeConversionUnits = {
  "cups": {
    "cups": 1,
    "tablespoons": 16,
    "teaspoons": 48,
    "litres": 0.236588,
    "millilitres": 236.588,
    "pints": 0.5,
    "fluid ounces": 8
  },
  "tablespoons": {
    "cups": 0.0625,
    "tablespoons": 1,
    "teaspoons": 3,
    "litres": 0.0147868,
    "millilitres": 14.7868,
    "pints": 0.03125,
    "fluid ounces": 0.5
  },
  "teaspoons": {
    "cups": 0.0208333,
    "tablespoons": 0.333333,
    "teaspoons": 1,
    "litres": 0.00492892,
    "millilitres": 4.92892,
    "pints": 0.0104167,
    "fluid ounces": 0.166667
  },
  "litres": {
    "cups": 4.22675,
    "tablespoons": 67.628,
    "teaspoons": 202.884,
    "litres": 1,
    "millilitres": 1000,
    "pints": 2.11338,
    "fluid ounces": 33.814
  },
  "millilitres": {
    "cups": 0.00422675,
    "tablespoons": 0.067628,
    "teaspoons": 0.202884,
    "litres": 0.001,
    "millilitres": 1,
    "pints": 0.00211338,
    "fluid ounces": 0.033814
  },
  "pints": {
    "cups": 2,
    "tablespoons": 32,
    "teaspoons": 96,
    "litres": 0.473176,
    "millilitres": 473.176,
    "pints": 1,
    "fluid ounces": 16
  },
  "fluid ounces": {
    "cups": 0.125,
    "tablespoons": 2,
    "teaspoons": 6,
    "litres": 0.0295735,
    "millilitres": 29.5735,
    "pints": 0.0625,
    "fluid ounces": 1
  }
};

function appendRow() {
  const table = document.getElementById("input-table");
    var newRow = table.insertRow(-1);
    numberOfRows++;

    const input1 = "<div class=\"input\" id=\"ingredient\">\n"
      + "  <input type=\"text\" id=\"ingredient-" + numberOfRows + "\" "
      + "class=\"input-ingredient typeahead\" "
      + "placeholder=\"Enter Ingredient\">\n"
      + "</div>";
    const input2 = "<div class=\"input\">\n"
      + "  <input type=\"number\" id=\"amount-" + numberOfRows + "\" min=\"0\" "
      + "class=\"input-amount\" placeholder=\"Enter Amount\">\n"
      + "</div>";
    const input3 = "<div class=\"input\">\n"
      + "  <select type=\"text\" id=\"unit-" + numberOfRows + "\" "
      + "class=\"input-unit\" placeholder=\"Choose Unit\">\n"
      + "</div>";
    const input4 = "<div class=\"input\">\n"
      + "  <input type=\"button\" "
      + "value=\"Delete...\" "
      + "class=\"btn btn-primary\" "
      + "onclick=\"deleteRow(this)\">\n"
      + "</div>";

    var cell1 = newRow.insertCell(0);
    var cell2 = newRow.insertCell(1);
    var cell3 = newRow.insertCell(2);
    var cell4 = newRow.insertCell(3);
    cell1.innerHTML = input1;
    cell2.innerHTML = input2;
    cell3.innerHTML = input3;
    cell4.innerHTML = input4;
    configure();
  //}
}

function deleteRow(row) {
  if (numberOfRows > 1) {
    numberOfRows--;
    const table = document.getElementById("input-table");
    var rowNumber = $(row).closest('tr').index() + 1;
    table.deleteRow(rowNumber);
  }
}

function getInput() {
  // Calculate total calories (grams only)
  var form = document.forms["calorie-input"];
  var totalCalories = 0;
  for (let i = 0; i < form.length - 3; i += 4) {
    let description = form[i].value;
    let ingredient = ingredients[description];
    let unit = form[i + 2].value;
    if (unit in weightConversionUnits) {
      let conversionFactor = weightConversionUnits[unit];
      totalCalories += (form[i + 1].value / ingredient["weightInGrams"])
                       * ingredient["energyPerMeasure"] * conversionFactor;
    } else {
      alert("Unit not found");
    }
  }

  // Display total calories
  // alert(totalCalories);
  displayResults(totalCalories);
}

// Execute when the DOM is fully loaded
$(document).ready(function() {  
  $('#sidebarCollapse').on('click', function() {
    $('#sidebar').toggleClass('active');
  });
  configure();
});

function configure() {
  
  // Configure typeahead
  $('#ingredient .typeahead').typeahead({
    minLength: 1,
    highlight: false,
    hint: false
  },
  {
    name: "description",
    display: "description",
    source: search,
    limit: 100
  });

  // Retrieve nutritional information after ingredient is selected
  $("#ingredient .typeahead").on("typeahead:select", function(event, suggestion) {

    // Configure ingredient information
    var ingredient = {};
    ingredient["weightInGrams"] = suggestion.weightInGrams;
    ingredient["measure"] = suggestion.measure;
    ingredient["energyPerMeasure"] = suggestion.energyPerMeasure;
    ingredients[suggestion.description] = ingredient;

    // Configure units
    var unitNumber = this.id.split("-")[1];
    var units = document.getElementById("unit-" + unitNumber);
    units.options[0] = new Option("Choose Units", "units");
    units.options[0].disabled = true;
    units.options[1] = new Option("milligrams (mg)", "milligrams");
    units.options[2] = new Option("grams (g)", "grams");
    units.options[3] = new Option("kilograms (kg)", "kilograms");
    units.options[4] = new Option("ounces (oz)", "ounces");
    units.options[5] = new Option("pounds (lb)", "pounds");

  });

}

// Search database for typeahead's suggestions
function search(query, syncResults, asyncResults) {

  // Query database asynchronously
  let parameters = {
    q: query
  };
  $.getJSON("/search", parameters, function(data, textStatus, jqXHR) {

    // Call typeahead's callback with search results
    asyncResults(data);
  });

}

/* Inserts HTML to display calorie results on the webpage */
/* individualCalories: array representing calorie of each ingredient */
function displayResults(totalCalories, individualCalories) {
  var toInsertAfter = document.getElementsByClassName("calorie-container")[0];
  var result_container = document.createElement("div");
  result_container.setAttribute("class", "result-container");
  var resultBox = document.createElement("div");
  resultBox.setAttribute("class", "result-box");
  resultBox.innerHTML = "<h3>This recipe contains...</h3>"
    + "<p class=\"calorie-result\">"
    + Math.floor(totalCalories) + " calories</p>";

  result_container.appendChild(resultBox);
  insertAfter(result_container, toInsertAfter);
}
function insertAfter(el, referenceNode) {
  referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
}
