/**
 * Javascript necessary for saved recipes page.
 * @file: savedrecipes.js
 */

let toDelete = []; // global var to track 

/**
 * Helper function to create the recipe table on saved recipes page.
 */
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
          responsive: true,
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
            { "data": "dateTime" }
          ],
          "order": [[1, 2, 'asc']]
        });

        // handle display recipe information
        $('#sr-recipe-table tbody').on('click', 'td.details-control', function() {
          let tr = $(this).closest('tr');
          let row = table.row(tr);
          let index;
          for (index = 0; index < recipes.length &&
              recipes[index][1] !== row.data()["recipeName"]; index++) {
            ; 
          }

          if (row.child.isShown()) {
            row.child.hide();
            tr.removeClass('shown');
          } else {
            row.child(data[index]["addInfo"]).show();
            tr.addClass('shown');
          }
        });
        
        $('#sr-recipe-table tbody').on('click', 'td.details-delete', function() {
          const recipeName = table.row( $(this).parents('tr') ).data()["recipeName"]
          if (window.confirm("Are you sure you want to delete \"" + recipeName + "\"?")) {
            toDelete.push(recipeName);

            // handle undo
            let alert = createDeleteAlert(recipeName, recipes);
            insertAlert(alert);

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

/**
 * Returns a HTML table element, representing recipe data.
 * @param {object} recipe - recipe data
 * @param {number} totalCalories - total calories of the given recipe
 */
function getAdditionalInfo(recipe, totalCalories) {
  let info = document.createElement("table");
  info.setAttribute("class", "table table-bordered table-sm sr-inner-table");
  let recipeData = JSON.parse(recipe);

  // create thead
  let headerText = ["Description", "Amount", "Units", "Calories"];
  let header = info.createTHead();
  header.setAttribute("class", "thead-light");
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
        cell.textContent = Math.floor(recipeData[ingredient][prop]);
      } else {
        cell.textContent = recipeData[ingredient][prop];
      }
    });
  });

  // insert total calories
  let calories = body.insertRow();
  let cell = calories.insertCell();
  cell.textContent = Math.floor(totalCalories) + " calories";
  cell.setAttribute("colspan", 4);
  return info;
}

/**
 * Returns an object parseable by DataTables to create recipe table.
 * @param {object} recipes - list of all recipes and their data
 */
function parseRecipeRowData(recipes) {
  let ret = [];
  Object.keys(recipes).forEach(key => {
    const recipe = recipes[key];
    let subObj = {};
    subObj["recipeName"] = recipe[1];
    subObj["calories"] = Math.floor(recipe[3]);
    subObj["dateTime"] = convertDate(recipe[4]);
    subObj["addInfo"] = getAdditionalInfo(recipe[2], recipe[3]);
    ret.push(subObj);
  });
  return ret;
}

/**
 * Returns an alert display the deletion event of a recipe.
 * @param {string} recipeName - recipeName associated with this alert
 * @param {object} recipes - list of all recipes and their data
 */
function createDeleteAlert(recipeName, recipes) {
  let alert = document.createElement("div");
  alert.setAttribute("id", "alert-" + replaceSpacesWithUnderscores(recipeName));
  const alertText = "You have deleted \"" + recipeName + "\"!";
  let button = document.createElement("button")
  button.setAttribute("class", "btn btn-sm btn-link");
  button.setAttribute("id", "undo-" + replaceSpacesWithUnderscores(recipeName));
  button.innerText = "Undo";
  handleUndoOnClick(recipeName, recipes);
  alert.setAttribute("role", "alert");
  alert.setAttribute("class","alert alert-warning alert-dismissible fade show");
  alert.appendChild(document.createTextNode(alertText));
  alert.appendChild(button);
  alert.appendChild(createDismissButtonForAlert());
  return alert;
}

/**
 * Function to handle undo event for a specific recipe.
 * @param {string} recipeName - name of recipe associated with this button
 * @param {object} recipes - list of all recipes and their data
 */
function handleUndoOnClick(recipeName, recipes) {
  $(document).on('click', '#undo-' + replaceSpacesWithUnderscores(recipeName), function() {
    findRecipe(recipeName, recipes).then((row) => {
      $('#sr-recipe-table').DataTable()
        .row
        .add(row)
        .draw();
      toDelete = toDelete.filter(names => names !== recipeName);
      insertAlert(createUndoneAlert());
      deleteAlert(recipeName);
    });
  })
}

/**
 * Returns an alert displaying "Recipe recovered!"
 */
function createUndoneAlert() {
  let alert = document.createElement("div");
  const alertText = "Recipe recovered!";
  alert.setAttribute("role", "alert");
  alert.setAttribute("class","alert alert-warning alert-dismissible fade show");
  alert.appendChild(document.createTextNode(alertText));
  alert.appendChild(createDismissButtonForAlert());
  return alert;
}

/**
 * Returns a dismiss button associated with Bootstrap alerts
 */
function createDismissButtonForAlert() {
  let dismissButton = document.createElement("button")
  dismissButton.setAttribute("class", "close");
  dismissButton.setAttribute("data-dismiss", "alert");
  dismissButton.setAttribute("aria-label", "Close");
  dismissButton.innerHTML = "<span aria-hidden=\"true\">&times;</span>"
  return dismissButton;
}

/**
 * Inserts the given alert into the webpage after the header
 * @param {HTML element} alert - alert to insert
 */
function insertAlert(alert) {
  let header = document.getElementsByClassName("header")[0];
  header.insertAdjacentElement("afterend", alert);
}

/**
 * Finds and deletes the alert associated with the given recipeName
 * @param {string} recipeName 
 */
function deleteAlert(recipeName) {
  let alert = document.getElementById("alert-" +
      replaceSpacesWithUnderscores(recipeName));
  if (alert !== null) {
    alert.parentNode.removeChild(alert);
  }
}

/**
 * Returns a new string containing the argument string, with all spaces
 * replaced with underscores.
 * @param {string} string - string to replace
 */
function replaceSpacesWithUnderscores(string) {
  return string.replace(/ /g,"_")
}

/**
 * Returns a DataTable-friendly object of a specific recipe.
 * @param {string} recipeName - name of recipe to find
 * @param {recipes} recipes - list of all recipes and their data
 */
function findRecipe(recipeName, recipes) {
  return new Promise((resolve, reject) => {
    let obj = {};
    Object.keys(recipes).forEach(key => {
      let recipe = recipes[key];
      if (recipe[1] === recipeName) {
        obj["recipeName"] = recipe[1];
        obj["calories"] = Math.floor(recipe[3]);
        obj["addInfo"] = getAdditionalInfo(recipe[2], recipe[3]);
      }
    });
    resolve(obj);
  });
}


// 2019-07-28 09:45:45
// 2019/07/28 09:45:45 UTC

function convertDate(dateString) {
  dateString = dateString.replace(/-/g, '/');
  dateString = dateString + " UTC";
  dateString = dateString.toLocaleString("en-US", {timeZone: "Asia/Singapore"});
  dateString = new Date(dateString);

  let mm = dateString.getMonth() + 1;
  let dd = dateString.getDate();
  let time = dateString.toTimeString().slice(0, 8);

  let ret = dateString.getFullYear() + "/"
    + (mm > 9 ? '' : '0') + mm + "/"
    + (dd > 9 ? '' : '0') + dd + " "
    + time;

  return ret;
}
