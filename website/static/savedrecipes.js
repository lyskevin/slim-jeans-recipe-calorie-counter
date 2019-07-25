/**
 * These 300 lines were written in my blood.
 * I hate Javascript and web pages.
 * Thank you very much.
 */

let toDelete = [];

function getAdditionalInfo(recipe, totalCalories) {
  let info = document.createElement("table");
  info.setAttribute("class", "sr-inner-table");
  let recipeData = JSON.parse(recipe);

  // create thead
  let headerText = ["Description", "Amount", "Units", "Calories"];
  let header = info.createTHead();
  let headerRow = header.insertRow();
  for (let header in headerText) {
    let th = document.createElement("th");
    th.innerText = headerText[header];
    headerRow.appendChild(th);
  }

  // create tbody
  let body = info.createTBody();
  Object.keys(recipeData).forEach(ingredient => {
    let row = body.insertRow();
    Object.keys(recipeData[ingredient]).forEach(prop => {
      let cell = row.insertCell();
      if (typeof(recipeData[ingredient][prop]) === "number") {
        cell.innerHTML = Math.floor(recipeData[ingredient][prop]);
      } else {
        cell.innerHTML = recipeData[ingredient][prop];
      }
    });
  });

  // insert total calories
  let calories = body.insertRow();
  let cell = calories.insertCell();
  cell.innerHTML = Math.floor(totalCalories);
  cell.setAttribute("colspan", 4);
  return info;
}

function parseRecipeRowData(recipes) {
  let ret = [];
  Object.keys(recipes).forEach(key => {
    const recipe = recipes[key];
    let subObj = {};
    subObj["recipeName"] = recipe[1];
    subObj["calories"] = Math.floor(recipe[3]);
    subObj["addInfo"] = getAdditionalInfo(recipe[2], recipe[3]);
    ret.push(subObj);
  });
  return ret;
}

function createRecipeTableForUser() {
  $.ajax("/get_all_recipe_data", {
    type: "POST",
  }).done(recipes => {
    if (recipes !== "") {
      // get data
      const data = parseRecipeRowData(recipes);

      // render table onto page
      $(document).ready(function () {
        let table = $('#sr-recipe-table').DataTable({
          data: data,
          columns: [
            {
                "className": 'details-control',
                "orderable": false,
                "data": null,
                "defaultContent": ''
            },
            {
                "className": 'details-delete',
                "orderable": false,
                "data": null,
                "defaultContent": ''
            },
            { "data": "recipeName" },
            { "data": "calories" },
          ],
          "order": [[1, 2, 'asc']]
        });

        $('#sr-recipe-table tbody').on('click', 'td.details-control', function() {
          let tr = $(this).closest('tr');
          let row = table.row(tr);
          let index = 0;
          for (let i = 0; i < recipes.length; i++) {
            let recipe = recipes[i];
            if (recipe[1] === row.data()["recipeName"]) {
              index = i;
              break;
            }
          }
          if (row.child.isShown()) {
            row.child.hide();
            tr.removeClass('shown');
          } else {
            let info = data[index]["addInfo"];
            row.child(info).show();
            tr.addClass('shown');
          }
        });
        
        $('#sr-recipe-table tbody').on('click', 'td.details-delete', function() {
          const recipeName = table.row( $(this).parents('tr') ).data()["recipeName"]
          if (window.confirm("Are you sure you want to delete \"" + recipeName + "\"?")) {

            // "fake" delete
            toDelete.push(recipeName);

            // handle undo
            let alert = createDeleteAlert(recipeName, recipes);
            insertAlert(alert);

            // delete row from table
            table.row( $(this).parents('tr') )
              .remove()
              .draw();
          }
        });

      });

      // delete from db when page unloads
      $(window).on('unload', function() {
        for (let key in toDelete) {
          $.ajax("/delete_recipe_data", {
            type: 'POST',
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
              "recipeName": toDelete[key]
            }),
            async:false,
          });
        }
      });
    }
  });
}

function createDeleteAlert(recipeName, recipes) {
  let alert = document.createElement("div");
  alert.setAttribute("id", "alert-" + replaceSpacesWithUnderscores(recipeName));
  const alertText = "You have deleted \"" + recipeName + "\"!";
  let button = document.createElement("button")
  button.setAttribute("class", "btn btn-sm btn-link");
  button.setAttribute("id", "undo-" + replaceSpacesWithUnderscores(recipeName));
  button.innerText = "Undo";

  $(document).on('click', '#undo-' + replaceSpacesWithUnderscores(recipeName), function() {
    let table = $('#sr-recipe-table').DataTable();
    let subObj = {};
    Object.keys(recipes).forEach(key => {
      let recipe = recipes[key];
      if (recipe[1] === recipeName) {
        subObj["recipeName"] = recipe[1];
        subObj["calories"] = Math.floor(recipe[3]);
        subObj["addInfo"] = getAdditionalInfo(recipe[2], recipe[3]);
      }
    });
    table.row.add(subObj);
    table.draw();
    toDelete = toDelete.filter(names => names !== recipeName);
    insertAlert(createUndoneAlert());
    deleteAlert(recipeName);
  })

  alert.setAttribute("role", "alert");
  alert.setAttribute("class","alert alert-warning alert-dismissible fade show");
  alert.appendChild(document.createTextNode(alertText));
  alert.appendChild(button);
  alert.appendChild(createDismissButtonForAlert());
  return alert;
}

function createUndoneAlert() {
  let alert = document.createElement("div");
  const alertText = "Recipe recovered!";
  alert.setAttribute("role", "alert");
  alert.setAttribute("class","alert alert-warning alert-dismissible fade show");
  alert.appendChild(document.createTextNode(alertText));
  alert.appendChild(createDismissButtonForAlert());
  return alert;
}

function deleteAlert(recipeName) {
  let alert = document.getElementById("alert-" + replaceSpacesWithUnderscores(recipeName));
  alert.parentNode.removeChild(alert);
}

function createDismissButtonForAlert() {
  let dismissButton = document.createElement("button")
  dismissButton.setAttribute("class", "close");
  dismissButton.setAttribute("data-dismiss", "alert");
  dismissButton.setAttribute("aria-label", "Close");
  dismissButton.innerHTML = "<span aria-hidden=\"true\">&times;</span>"
  return dismissButton;
}

function insertAlert(alert) {
  let header = document.getElementsByClassName("header")[0];
  header.insertAdjacentElement("afterend", alert);
}

function saveRecipe() {
  var form = document.forms["calorie-input"];
  var totalCalories = 0;
  var recipe = {};

  let missingInput = false;
  let negativeAmount = false;

  for (let i = 0; i < form.length - 5 && !missingInput
    && !negativeAmount; i += 4) {
    let description = form[i].value;
    let amount = form[i + 1].value;
    let unit = form[i + 2].value;
    let calories = 0;

    if (!(description == "" && amount == "" && unit == "")) {
      if (description == "" || amount == "" || unit == "" || unit == "units") {
        missingInput = true;
      } else if (amount < 0) {
        negativeAmount = true;
      } else {
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
    }
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

function replaceSpacesWithUnderscores(string) {
  return string.replace(/ /g,"_")
}

function replaceUnderscoresWithSpaces(string) {
  return string.replace(/_/g, ' ');
}
