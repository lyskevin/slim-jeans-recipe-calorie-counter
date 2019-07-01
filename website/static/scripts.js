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
      + "step=\"0.000001\" class=\"input-amount\" "
      + "placeholder=\"Enter Amount\">\n"
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
  // Calculate total calories
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
    } else if (unit in volumeConversionUnits) {
      let conversionFactor = volumeConversionUnits[unit][ingredient["measure"]];
      totalCalories += (form[i + 1].value / ingredient["measureAmount"])
                       * ingredient["energyPerMeasure"] * conversionFactor;
    } else {
      totalCalories += (form[i + 1].value / ingredient["measureAmount"])
                       * ingredient["energyPerMeasure"];
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
    var measure = suggestion.measure;
    ingredient["energyPerMeasure"] = suggestion.energyPerMeasure;
    ingredients[suggestion.description] = ingredient;

    // Configure weight units
    var unitNumber = this.id.split("-")[1];
    var units = document.getElementById("unit-" + unitNumber);
    for (let i = units.options.length - 1; i >= 0; i -= 1) {
      units.remove(i);
    }
    units.options[0] = new Option("Choose Units", "units");
    units.options[0].disabled = true;
    configureWeightUnits(units);

    // Configure units related to household measures
    if (measure.indexOf("cup") !== -1) {
      configureVolumeUnits(units);
      ingredient["measureAmount"] = parseFloat(measure);
      ingredient["measure"] = "cups";
    } else if (measure.indexOf("tbsp") !== -1) {
      configureVolumeUnits(units);
      ingredient["measureAmount"] = parseFloat(measure);
      ingredient["measure"] = "tablespoons";
    } else if (measure.indexOf("tsp") !== -1) {
      configureVolumeUnits(units);
      ingredient["measureAmount"] = parseFloat(measure);
      ingredient["measure"] = "teaspoons";
    } else if (measure.indexOf("ml") !== -1) {
      configureVolumeUnits(units);
      ingredient["measureAmount"] = parseFloat(measure);
      ingredient["measure"] = "millilitres";
    } else if (measure.indexOf("pint") !== -1) {
      configureVolumeUnits(units);
      ingredient["measureAmount"] = parseFloat(measure);
      ingredient["measure"] = "pints";
    } else if (measure.indexOf("fl oz") !== -1) {
      configureVolumeUnits(units);
      ingredient["measureAmount"] = parseFloat(measure);
      ingredient["measure"] = "fluid ounces";
    } else {
      let unit = measure.substr(measure.indexOf(" ") + 1);
      units[units.length] = new Option(unit, unit);
      ingredient["measureAmount"] = parseFloat(measure);
      ingredient["measure"] = unit;
    }
  });

}

// Configure volume units
function configureVolumeUnits(units) {
  units[units.length] = new Option("cups", "cups");
  units[units.length] = new Option("tablespoons (tbsp)", "tablespoons");
  units[units.length] = new Option("teaspoons (tsp)", "teaspoons");
  units[units.length] = new Option("litres (l)", "litres");
  units[units.length] = new Option("millilitres (ml)", "millilitres");
  units[units.length] = new Option("pints", "pints");
  units[units.length] = new Option("fluid ounces (fl oz)", "fluid ounces");
}

// Configure weight units
function configureWeightUnits(units) {
  units.options[units.length] = new Option("milligrams (mg)", "milligrams");
  units.options[units.length] = new Option("grams (g)", "grams");
  units.options[units.length] = new Option("kilograms (kg)", "kilograms");
  units.options[units.length] = new Option("ounces (oz)", "ounces");
  units.options[units.length] = new Option("pounds (lb)", "pounds");
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
  var result_container = document.getElementsByClassName("result-container")[0];
  if (result_container != null) {
    result_container.parentNode.removeChild(result_container);
  }
  result_container = createResultContainer(totalCalories);
  insertAfter(result_container, toInsertAfter);
}

function insertAfter(el, referenceNode) {
  referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
}

function createResultContainer(totalCalories) {
  var result_container = document.createElement("div");
  result_container.setAttribute("class", "result-container");
  
  var resultBox = document.createElement("div");
  resultBox.setAttribute("class", "result-box");

  resultBox.innerHTML = "<h3>This recipe contains...</h3>"
    + "<p class=\"calorie-result\">"
    + Math.floor(totalCalories) + " calories</p>";
  result_container.appendChild(resultBox);

  return result_container;
}
