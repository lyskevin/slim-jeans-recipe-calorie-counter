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

document.addEventListener('DOMContentLoaded', (event) => {
  if (localStorage.getItem('mode') === 'dark') {
    document.querySelector('body').classList.add('dark');
    $('#table-savedrecipes').addClass('table-dark');
  } else {
    document.querySelector('body').classList.remove('dark');
    $('#table-savedrecipes').removeClass('table-dark');
  }    
});

/**
 * Adds event to the specified button.
 * @param {string} type - type of the button: specify "delete", or "show"
 * @param {array} data - array of data to be entered into the table
 */
function addEventToButton(type, data) {
  if (type === "delete") {
    if (window.confirm("Do you really want to delete recipe \"" + data[1] + "\"?")) {
      let wrapper = {
        "username": data[0],
        "recipeName": data[1]
      }
      $.ajax("/delete_recipe_data", {
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify(wrapper)
      })
      .done(handleUndoDelete(data));
    }
  } else if (type === "show") {
    deleteElement("savedrecipes-result");
    let table = document.createElement("table");
    table.setAttribute("class", "table table-striped table-sm table-bordered");
    table.setAttribute("id", "savedrecipes-results-table");
    generateTableData(table, data);
    generateTableHead(table);

    let div = document.createElement("div")
    div.setAttribute("id", "undo-msg");
    let header = document.createElement("h4");
    header.appendChild(document.createTextNode("Viewing recipe for \""
        + data[1]
        + "\""));
    div.setAttribute("class", "savedrecipes-result")
    div.appendChild(header);
    div.appendChild(table);
    document
      .getElementsByClassName("savedrecipes-container")[0]
      .insertAdjacentElement("beforeend", div);
  } else if (type === "undo") {
    data = {
      "username": data[0],
      "recipeName": data[1],
      "recipe": data[2],
      "calories": data[3]
    }
    $.ajax("/reinsert_recipe", {
      type: "POST",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify(data)
    })
    .done(message => {
      // removes the undo msg
      let div = document.getElementById("undo-msg");

      div.setAttribute("id", "redone-msg");
      let undoneMsg = document.createTextNode("Recipe recovered.");
      while (div.firstChild)
        div.removeChild(div.firstChild);
      div.appendChild(undoneMsg);
      appendDismissButton(div);

      document.getElementsByClassName("header")[0]
        .insertAdjacentElement("afterend", div);
      location.reload();
    });
  }
}

function appendDismissButton(el) {
  let dismissButton = document.createElement("button")
  dismissButton.setAttribute("class", "close");
  dismissButton.setAttribute("data-dismiss", "alert");
  dismissButton.setAttribute("aria-label", "Close");
  dismissButton.innerHTML = "<span aria-hidden=\"true\">&times;</span>"
  el.appendChild(dismissButton);
}

/* Appends a row to the calorie counter's input table */
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
    + "class=\"input-unit\">\n"
    + "</div>";
  const input4 = "<div class=\"input\">\n"
    + "  <input type=\"button\" "
    + "value=\"Delete Ingredient\" "
    + "class=\"btn btn-light\" "
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
  configure(numberOfRows);
}

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

/**
 * Returns a button with the specified id and type.
 * @param {string} id - id of the specified button
 * @param {string} type - type of the button: specify "delete", or "show"
 */
function createButton(id, type, onClickFunction) {
  let button = document.createElement("button");
  button.setAttribute("id", id);
  if (type === "delete") {
    button.setAttribute("class", "btn btn-sm btn-danger");
    button.innerText = "Delete";
  } else if (type === "show") {
    button.setAttribute("class", "btn btn-sm btn-primary");
    button.innerText = "Display";
  } else if (type === "undo") {
    button.setAttribute("class", "btn btn-sm btn-link");
    button.innerText = ("Undo");
  } else {
    button.setAttribute("class", "btn btm-sm btn-light");
    button.innerText = "";
  }
  button.onclick = onClickFunction;
  return button;
}

/**
 * Saved Recipe: Creates the recipe table for the user
 * @param {string} username - session.username
 */
function createRecipeTableForUser(username) {
  $.ajax("/get_all_recipe_data", {
    type: "POST",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify(username)
  })
  .done(recipes => {
    if (recipes == "") {
      return;
    }
    const table = document.getElementById("savedrecipes-recipes-table").lastElementChild;
    generateRecipeTableBody(table, recipes);
  });
}

/* Creates a container to display the specified total number
   of calories and pie chart of breakdown */
function createResultContainer(totalCalories) {

  var resultContainer = document.createElement("div");
  resultContainer.setAttribute("class", "result-container");

  resultContainer.innerHTML = "<h3>This recipe contains...</h3>"
    + "<p class=\"calorie-result\">"
    + Math.floor(totalCalories) + " calories</p>"
    + "<div id=\"piechart\" style=\"width: 900px; height: 500px\"></div>";

  return resultContainer;

}

function deleteElement(className) {
  let el = document.getElementsByClassName(className)[0]
  if (el != null) {
    el.parentNode.removeChild(el);
  }
}

/* Deletes the specified row from the calorie counter's input table */
function deleteRow(row) {
  if (numberOfRows > 1) {
    numberOfRows--;
    const table = document.getElementById("input-table");
    var rowNumber = $(row).closest('tr').index() + 1;
    table.deleteRow(rowNumber);
  }
}

/* Inserts HTML to display calorie results and breakdown on the webpage */
function displayResults(totalCalories, breakdown) {
  
  var toInsertAfter = document.getElementsByClassName("calorie-container")[0];
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
  
  google.visualization.events.addListener(chart, 'nightMode', drawChart());

}

/* Saved Recipes: Helper functions; generates recipe table */
function generateRecipeTableBody(table, data) {
  let tableData = [];
  for (let i = 0; i < data.length; i++) {
    tableData.push(data[i][1]);
    tableData.push(data[i][3]);
  }
  const numberOfRecipes = tableData.length / 2;
  for (let i = 0, j = 0; i < numberOfRecipes; i++, j += 2) {
    let newRow = table.insertRow();
    newRow.setAttribute("id", tableData[j]);
    let showButton = createButton("btn-sr-show-" + (i + 1), "show", () => {
      return addEventToButton("show", data[i]);
    });
    let deleteButton = createButton("btn-sr-del-" + (i + 1), "delete", () => {
      return addEventToButton("delete", data[i]);
    });

    newRow.insertCell().innerHTML = tableData[j];
    newRow.insertCell().innerHTML = Math.floor(tableData[j + 1]);
    let cellWithButtons = newRow.insertCell()
    cellWithButtons.appendChild(showButton);
    cellWithButtons.appendChild(deleteButton);
  }
}

/* Saved Recipes: Generates results table head */
function generateTableHead(table) {
  const tableHeaders = ["Item", "Amount", "Unit", "Calories"];
  let thead = table.createTHead();
  let row = thead.insertRow();
  for (let key of tableHeaders) {
    let th = document.createElement("th");
    let text = document.createTextNode(key);
    th.appendChild(text);
    row.appendChild(th);
  }
}

/* Saved Recipes: Generates results table body */
function generateTableData(table, data) {
  const tableData = JSON.parse(data[2]);
  const totalCalories = data[3];

  Object.keys(tableData).forEach((key) => {
    let row = table.insertRow();
    Object.keys(tableData[key]).forEach((el) => {
      let cell = row.insertCell();
      let value = tableData[key][el]
      if (typeof(value) === "number")
        value = Math.floor(value);
      cell.appendChild(document.createTextNode(value));
    });
  });

  table.insertRow().insertCell()
    .appendChild(document
    .createTextNode(Math.floor(totalCalories) + " calories"));
}

/* Gets input from the calorie counter and calculates the total number of calories */
function getInput() {
  var form = document.forms["calorie-input"];
  var totalCalories = 0;
  var breakdown = [["Description", "Calories"]];
  var recipe = {};

  let missingInput = false;
  let negativeAmount = false;

  for (let i = 0; i < form.length - 5; i += 4) {
    let description = form[i].value;
    let amount = form[i + 1].value;
    let unit = form[i + 2].value;
    let calories = 0;

    if (description == "" && amount == "" && unit == "") {
      continue
    }

    if (description == "" || amount == "" || unit == "" || unit == "units") {
      missingInput = true;
      break;
    }
    
    if (amount < 0) {
      negativeAmount = true;
      break;
    }
    
    let ingredient = ingredients[description];
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
    totalCalories += calories;
    breakdown[breakdown.length] = [description, calories];

    // Store recipe
    let ingredientInformation = {};
    ingredientInformation["description"] = description;
    ingredientInformation["amount"] = amount;
    ingredientInformation["unit"] = unit;
    ingredientInformation["calories"] = calories;
    recipe["ingredient" + (i / 4 + 1)] = ingredientInformation;
  }

  if (missingInput) {
    alert("Please fill in all input fields");
  } else if (negativeAmount) {
    alert("Negative amount values are not allowed");
  } else {
    displayResults(totalCalories, breakdown);
  }
}

/* Saved Recipes: Handles undo event when user deletes a recipe */
function handleUndoDelete(data) {
  const recipeName = data[1];
  let div = document.createElement("div");
  div.setAttribute("id", "undo-msg");
  div.setAttribute("class", "alert alert-warning alert-dismissible fade show");
  let deletedMsg = document.createTextNode("Deleted " + recipeName + ".");
  div.appendChild(document.createTextNode("Deleted " + recipeName + "."));
  div.appendChild(createButton("sr-btn-undo", "undo", function() {
    return addEventToButton("undo", data);
  }));
  appendDismissButton(div);
  document.getElementsByClassName("header")[0]
    .insertAdjacentElement("afterend", div);
  let tr = document.getElementById(recipeName);
  tr.parentNode.removeChild(tr);
}

/* Inserts the specified element after the specified reference node */
function insertAfter(el, referenceNode) {
  referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
}

/* Handles the registration form submission */
function registrationFormSubmission() {
  var form = document.forms["registration-form"];
  var username = form[0].value;
  var password = form[1].value;
  var confirmation = form[2].value;
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

/* Saves the recipe specified by the user */
function saveRecipe() {
  var form = document.forms["calorie-input"];
  var totalCalories = 0;
  var recipe = {};

  let missingInput = false;
  let negativeAmount = false;

  for (let i = 0; i < form.length - 5; i += 4) {
    let description = form[i].value;
    let amount = form[i + 1].value;
    let unit = form[i + 2].value;
    let calories = 0;

    if (description == "" && amount == "" && unit == "") {
      continue;
    }

    if (description == "" || amount == "" || unit == "" || unit == "units") {
      missingInput = true;
      break;
    }

    if (amount < 0) {
      negativeAmount = true;
      break;
    }

    let ingredient = ingredients[description];
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
    totalCalories += calories;

    let ingredientInformation = {};
    ingredientInformation["description"] = description;
    ingredientInformation["amount"] = amount;
    ingredientInformation["unit"] = unit;
    ingredientInformation["calories"] = calories;
    recipe["ingredient" + (i / 4 + 1)] = ingredientInformation;

  }

  if (missingInput) {
    alert("Please fill in all input fields");
  } else if (negativeAmount) {
    alert("Negative amount values are not allowed");
  } else {
    recipeName = form[form.length - 2].value;
    if (recipeName === "") {
      alert("Please include a recipe name");
    } else {
      data = {};
      data["recipeName"] = recipeName;
      data["recipe"] = JSON.stringify(recipe);
      data["calories"] = totalCalories;
      if (data["recipe"].length > 7500) {
        alert("Your recipe is too large to be stored!");
      } else {
        $.ajax("/save_recipe", {
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(data)
        })
        .done(str => {
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

/* Alerts the user that the selected username is already in use */
function usernameInUseAlert() {
  alert("Username already in use");
}

/* Toggles night mode
   Source: https://flaviocopes.com/dark-mode/ */
function toggleNightMode() {
  localStorage.setItem('mode', (localStorage.getItem('mode') || 'dark') === 'dark' ?
    'light' : 'dark');
  if (localStorage.getItem('mode') === 'dark') {
    document.querySelector('body').classList.add('dark');
    $('#table-savedrecipes').addClass('table-dark');
    $('#table-recipe-result').addClass('table-dark');
  } else {
    document.querySelector('body').classList.remove('dark');
    $('#table-savedrecipes').removeClass('table-dark');
    $('#table-recipe-result').removeClass('table-dark');
  }
  var piechart = document.getElementById("piechart");
  if (piechart !== null) {
    getInput();
  }    
}

