/* Global variables */
var numberOfRows = 1;
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

/* Executes when the DOM is fully loaded */
$(document).ready(function() {  
  $('#sidebarCollapse').on('click', function() {
    $('#sidebar').toggleClass('active');
  });
  configure(1);
});

/**
 * Functions handling Calorie Counter forms.
 */

/* Configures the DOM */
function configure(ingredientNumber) {
  
  // Configure typeahead
  let ingredientDescriptionElement = '#ingredient-' + ingredientNumber;
  $(ingredientDescriptionElement).typeahead({
    minLength: 1,
    highlight: false,
    hint: false
  },
  {
    name: "description",
    display: "description",
    source: search,
    limit: 1000
  });

  // Retrieve nutritional information after ingredient is selected
  $(ingredientDescriptionElement).on("typeahead:select",
    function(event, suggestion) {

      // Configure ingredient information
      var ingredient = {};
      ingredient["weightInGrams"] = suggestion.weightInGrams;
      var measure = suggestion.measure;
      ingredient["energyPerMeasure"] = suggestion.energyPerMeasure;
      ingredients[suggestion.description] = ingredient;

      // Configure weight units
      //var unitNumber = this.id.split("-")[1];
      var unitNumber = ingredientNumber;
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

/* Configures volume units in the specified "units" element in the table */
function configureVolumeUnits(units) {
  units[units.length] = new Option("cups", "cups");
  units[units.length] = new Option("tablespoons (tbsp)", "tablespoons");
  units[units.length] = new Option("teaspoons (tsp)", "teaspoons");
  units[units.length] = new Option("litres (l)", "litres");
  units[units.length] = new Option("millilitres (ml)", "millilitres");
  units[units.length] = new Option("pints", "pints");
  units[units.length] = new Option("fluid ounces (fl oz)", "fluid ounces");
}

/* Configures weight units in the specified "units" element in the table */
function configureWeightUnits(units) {
  units.options[units.length] = new Option("milligrams (mg)", "milligrams");
  units.options[units.length] = new Option("grams (g)", "grams");
  units.options[units.length] = new Option("kilograms (kg)", "kilograms");
  units.options[units.length] = new Option("ounces (oz)", "ounces");
  units.options[units.length] = new Option("pounds (lb)", "pounds");
}

function createInputTable() {
  $(document).ready(function() {
    let table = $('#input-table').DataTable({
      "autoWidth": false,
      "paging": false,
      "ordering": false,
      "searching": false,
      "bInfo": false,
      "columns": [
        null,
        { "width": "256" },
        { "width": "150" },
        { "width": "20" }
      ]
    });

    $(function () {
      $('#add-ingred').click();
    });

    /* handle add row */
    $('.calorie-wrapper').on('click', '#add-ingred', function() {
      let numRows = table.data().count() / 4;
      let rowEl = getRowElements(numRows);
      let idNo = rowEl.pop();
      table.row.add(rowEl).draw();
      configure(idNo);
    });

    /* handle delete row */
    $('#input-table').on('click', '.remove', function() {
      let numRows = table.data().count() / 4;
      if (numRows > 1) {
        let row = $(this).closest('tr');
        table.row(row).remove().draw();
      }
    });

    /* handle analyze calories */
    $('.calorie-wrapper').on('click', '#analyze-ingred', function() {
      let numRows = table.data().count() / 4;
      getInput();
    });
  });
}

function getRowElements(numRows) {
  let firstCell = document.createElement('input');
  firstCell.setAttribute('type', 'text');
  firstCell.setAttribute('class', 'input-ingredient typeahead');
  firstCell.setAttribute('placeholder', 'Enter Ingredient');
  while (document.getElementById('ingredient-' + numRows) != null) {
    numRows += 1;
  }
  firstCell.setAttribute('id', 'ingredient-' + numRows);
  firstCell.setAttribute('style', 'width: 512px;');

  let secondCell = document.createElement('input');
  secondCell.setAttribute('type', 'number');
  secondCell.setAttribute('min', '0');
  secondCell.setAttribute('step', '0.000001');
  secondCell.setAttribute('class', 'input-amount');
  secondCell.setAttribute('placeholder', 'Enter Amount');

  let thirdCell = document.createElement('select');
  thirdCell.setAttribute('type', 'text');
  thirdCell.setAttribute('class', 'input-unit');
  thirdCell.setAttribute('id', 'unit-' + numRows);

  let fourthCell = document.createElement('input');
  fourthCell.setAttribute('type', 'button');
  fourthCell.setAttribute('class', 'btn btn-danger btn-block remove');
  fourthCell.setAttribute('value', 'Delete');

  return [
    asHTMLString(firstCell),
    asHTMLString(secondCell),
    asHTMLString(thirdCell),
    asHTMLString(fourthCell),
    numRows
  ];
}

function asHTMLString(el) {
  let div = document.createElement('div');
  div.appendChild(el);
  return div.innerHTML;
}

/* Gets input from the calorie counter and calculates the total number of calories */
function getInput() {
  // 0-th element are the headers of the pie chart elements
  let breakdown = [["Description", "Calories"]];

  let form = document.forms["calorie-form"];
  let totalCalories = 0;
  let recipe = {};

  let missingInput = false;
  let negativeAmount = false;
  for (let i = 0;
       i < form.length - 5 && !missingInput && !negativeAmount;
       i += 4) {
    let description = form[i].value;
    let amount = form[i + 1].value;
    let unit = form[i + 2].value;

    if (!isAnEmptyRow(description, amount, unit)) {
      if (hasMissingInput(description, amount, unit))
        missingInput = true;
      else if (hasNegativeAmount(amount))
        negativeAmount = true;
      else {
        let calories = getCaloriesOfIngredient(description, amount, unit);
        totalCalories += calories;
        breakdown.push([description, calories]);

        // Store recipe
        let ingredientInformation = {};
        ingredientInformation["description"] = description;
        ingredientInformation["amount"] = amount;
        ingredientInformation["unit"] = unit;
        ingredientInformation["calories"] = calories;
        recipe["ingredient" + (i / 4 + 1)] = ingredientInformation;
      }
    }
  }

  if (missingInput || totalCalories === 0)
    alert("Please fill in all input fields");
  else if (negativeAmount)
    alert("Negative amount values are not allowed");
  else
    displayResults(totalCalories, breakdown);
}

/* Saves the recipe specified by the user */
function saveRecipe() {
  let form = document.forms["calorie-form"];
  let recipeName = form[form.length - 2].value;
  if (recipeName === "")
    alert("Please include a recipe name.");
  else if (!/^[a-zA-Z0-9!@#$%^*_,\s]+$/i.test(recipeName)) {
    alert("Invalid recipe name.");
  } else {
    console.log("asd");
    let totalCalories = 0;
    let recipe = {};

    let missingInput = false;
    let negativeAmount = false;
    for (let i = 0;
         i < form.length - 5 && !missingInput && !negativeAmount;
         i += 4) {
      let description = form[i].value;
      let amount = form[i + 1].value;
      let unit = form[i + 2].value;

      if (!isAnEmptyRow(description, amount, unit)) {
        if (hasMissingInput(description, amount, unit))
          missingInput = true;
        else if (hasNegativeAmount(amount))
          negativeAmount = true;
        else {
          let calories = getCaloriesOfIngredient(description, amount, unit);
          totalCalories += calories;

          // Store recipe
          let ingredientInformation = {};
          ingredientInformation["description"] = description;
          ingredientInformation["amount"] = amount;
          ingredientInformation["unit"] = unit;
          ingredientInformation["calories"] = calories;
          recipe["ingredient" + (i / 4 + 1)] = ingredientInformation;
        }
      }
    }

    if (missingInput || totalCalories === 0) {
      alert("Please fill in all input fields");
    } else if (negativeAmount) {
      alert("Negative amount values are not allowed");
    } else {
      let recipeName = form[form.length - 2].value;
      data = {
        "recipeName": recipeName,
        "recipe": JSON.stringify(recipe),
        "calories": totalCalories
      }
      if (data["recipe"].length > 7500) {
        alert("Your recipe is too large to be stored!");
      } else {
        $.ajax("/save_recipe", {
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(data)
        }).done(str => {
          if (str == "Recipe Exists") {
            alert("Recipe already exists!")
          } else {
            alert("Recipe saved")
          }
        });
      }
    }
  }
}

/* Searches the food database for typeahead's suggestions */
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

/* Helper functions for input validation */
function isAnEmptyRow(desc, amount, unit) {
  return desc === "" && amount === "" && unit === "";
}

function hasMissingInput(desc, amount, unit) {
  return desc === "" || amount === "" || unit === "" || unit === "units";
}

function hasNegativeAmount(amount) {
  return amount < 0;
}

function getCaloriesOfIngredient(desc, amount, unit) {
  let calories = 0;
  let ingredient = ingredients[desc];
  if (unit in weightConversionUnits) {
    let conversionFactor = weightConversionUnits[unit];
    calories += (amount / ingredient["weightInGrams"])
      * ingredient["energyPerMeasure"] * conversionFactor;
  } else if (unit in volumeConversionUnits) {
    let conversionFactor = volumeConversionUnits[unit][ingredient["measure"]];
    calories += (amount / ingredient["measureAmount"])
      * ingredient["energyPerMeasure"] * conversionFactor;
  } else {
    calories += (amount / ingredient["measureAmount"])
      * ingredient["energyPerMeasure"];
  }
  return calories;
}

/* Creates a container to display the specified total number
   of calories and pie chart of breakdown */
function createResultContainer(totalCalories) {
  let resultContainer = document.createElement("div");
  resultContainer.setAttribute("class", "result-container");
  resultContainer.innerHTML = "<h3>This recipe contains...</h3>"
    + "<p class=\"calorie-result\">"
    + Math.floor(totalCalories) + " calories</p>"
    + "<div id=\"piechart\" style=\"width: 900px; height: 500px\"></div>";
  return resultContainer;
}

/* Inserts HTML to display calorie results and breakdown on the webpage */
function displayResults(totalCalories, breakdown) {
  var toInsertAfter = document.getElementsByClassName("calorie-wrapper")[0];
  var resultContainer = document.getElementsByClassName("result-container")[0];
  if (resultContainer != null) {
    resultContainer.parentNode.removeChild(resultContainer);
  }
  resultContainer = createResultContainer(totalCalories);
  insertAfter(resultContainer, toInsertAfter);

  google.charts.load("current", {"packages":["corechart"]});
  google.charts.setOnLoadCallback(drawChart);

  function drawChart() {
    var data = google.visualization.arrayToDataTable(breakdown);
    var options = {};
    if (localStorage.getItem('mode') === 'dark') {
      options = {
        title: "Breakdown",
        titleTextStyle: {
          color: 'white'
        },
        legend: {
          textStyle: {
            color: 'white'
          }
        },
        backgroundColor: '#232b2b',
        color: 'white'
      };
    } else {
      options = {
        title: "Breakdown"
      };
    }
    var chart =
      new google.visualization.PieChart(document.getElementById("piechart"));
    chart.draw(data, options);
  }
}

/**
 * Handles form registration submission.
 */
function registrationFormSubmission() {
  let form = document.forms["registration-form"];
  let username = form[0].value;
  let password = form[1].value;
  let confirmation = form[2].value;
  if ($.trim(username) === "" || $.trim(password) === "") {
    alert("Please fill in all fields (space padding is not allowed)");
  } else if (password.length < 5) {
    alert("Password must be at least 5 characters in length");
  } else if (username.length > 255 || password.length > 255) {
    alert("Username and password cannot exceed 255 characters in length");
  } else if (password !== confirmation) {
    alert("Passwords don't match");
  } else {
    form.submit();
  }
}

/* Toggles night mode in the website
 * Source: https://flaviocopes.com/dark-mode/ */
document.addEventListener('DOMContentLoaded', (event) => {
  if (localStorage.getItem('mode') === 'dark') {
    document.querySelector('body').classList.add('dark');
    $('#sr-recipe-table').addClass('table-dark');
    $('#input-table').addClass('table-dark');
    $('.sr-inner-table').addClass('table-dark');
  } else {
    document.querySelector('body').classList.remove('dark');
    $('#sr-recipe-table').removeClass('table-dark');
    $('#input-table').removeClass('table-dark');
    $('.sr-inner-table').removeClass('table-dark');
  }    
});

function toggleNightMode() {
  localStorage.setItem('mode', (localStorage.getItem('mode') || 'dark') === 'dark' ?
    'light' : 'dark');
  if (localStorage.getItem('mode') === 'dark') {
    document.querySelector('body').classList.add('dark');
    $('#sr-recipe-table').addClass('table-dark');
    $('#input-table').addClass('table-dark');
    $('.sr-inner-table').addClass('table-dark');
  } else {
    document.querySelector('body').classList.remove('dark');
    $('#sr-recipe-table').removeClass('table-dark');
    $('#input-table').removeClass('table-dark');
    $('.sr-inner-table').removeClass('table-dark');
  }
  var piechart = document.getElementById("piechart");
  if (piechart !== null) {
    getInput();
  }
  var graph = document.getElementById("column_chart");
  if (graph !== null) {
    generateGraph();
  }    
}

/* Inserts the specified element after the specified reference node */
function insertAfter(el, referenceNode) {
  referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
}

/* Generates a graph of the user's saved recipes' caloric information */
function generateGraph() {
  $.ajax("/graph_generator", {
    type: "POST",
  }).done(results => {
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
      var dataset = [["Date", "Calories"]];
      for (let i = 0; i < results.length; i++) {
        var data = [];
        var dateString = results[i][1];
        dateString = dateString.replace(/-/g, '/');
        dateString = dateString + " UTC";
        dateString = dateString.toLocaleString("en-US", {timeZone: "Asia/Singapore"});
        dateString = new Date(dateString);
        data[0] = dateString;
        data[1] = results[i][0];
        dataset[i + 1] = data;
      }
      dataset = google.visualization.arrayToDataTable(dataset);
      var options = {};
      if (localStorage.getItem('mode') === 'dark') {
        options = {
          title: 'Calorie Graph',
          titleTextStyle: {
            color: 'white'
          },
          legend: {
            textStyle: {
              color: 'white'
            },
            position: 'bottom'
          },
          hAxis: {
            textStyle: {
              color: 'white'
            }
          },
          vAxis: {
            textStyle: {
              color: 'white'
            }
          },
          backgroundColor: '#232b2b',
          /*colors: ['red', 'orange', 'yellow', 'green', 'blue', 'purple']*/
        };
      } else {
        options = {
          title: 'Calorie Graph',
          legend: {position: 'bottom'}
        }
      }

      var chart =
        new google.visualization.ColumnChart(document.getElementById('column_chart'));

      chart.draw(dataset, options);
    }

  });
    
}

/* Handles the form submission for changing passwords */
function changePasswordFormSubmission() {
  let form = document.forms["change-password-form"];
  let newPassword = form[1].value;
  let confirmation = form[2].value;
  if ($.trim(newPassword) === "") {
    alert("Please fill in all fields (space padding is not allowed)");
  } else if (newPassword.length < 5) {
    alert("New password must be at least 5 characters in length");
  } else if (newPassword.length > 255) {
    alert("New password cannot exceed 255 characters in length");
  } else if (newPassword !== confirmation) {
    alert("Passwords don't match");
  } else {
    form.submit();
  }
}
