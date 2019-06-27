var numberOfRows = 1; // current number of rows
var ingredients = {};
var weightConversionUnits = {
  "milligrams": 0.001,
  "grams": 1.0,
  "kilograms": 1000.0,
  "ounces": 28.3495,
  "pounds": 453.592
}

function appendRow() {
  const table = document.getElementById("input-table");
  //if ($("#ingredient-1").val() == ""
  //    || $("#amount-1").val() == ""
  //    || $("#unit-1").val() == "") {
  //  alert("Please fill in all input fields for the previous ingredient");
  //} else {
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
  alert(totalCalories);
  
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

