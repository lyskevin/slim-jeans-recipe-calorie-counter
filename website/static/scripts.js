let nRows = 0; // current number of rows

function appendRow(tableID) {
  var table = document.getElementsByClassName(tableID)[0];
  var newRow = table.insertRow(-1);
  nRows++;
  const input1 = "<input type='text' name='ingredient-" + nRows + "' class='input=ingredient'>";
  const input2 = "<input type='number' name='amount-" + nRows + "' min='0' class='input-amount'>";
  const input3 = "<input type='text' name='unit-" + nRows + "' class='input-unit'>";
  var cell1 = newRow.insertCell(0);
  var cell2 = newRow.insertCell(1);
  var cell3 = newRow.insertCell(2);
  cell1.innerHTML = input1;
  cell2.innerHTML = input2;
  cell3.innerHTML = input3;
}

function deleteLastRow(tableID) {
  if (nRows > 0) {
    nRows--;
    const table = document.getElementsByClassName(tableID)[0];
    table.deleteRow(-1);
  }
}

function getInput() {
  const str = new FormData(document.forms["calorie-input"]);
  document.forms["calorie-input"].submit();
  for (var pair of str.entries()) {
    alert(pair[0] + ', ' + pair[1]);
  }
}

// Execute when the DOM is fully loaded
$(document).ready(function() {
  $('#sidebarCollapse').on('click', function () {
    $('#sidebar').toggleClass('active');
  });

  // Configure typeahead
  $('#ingredient .typeahead').typeahead({
    minLength: 1,
    highlight: false,
    hint: false
  },
  {
    source: search,
    limit: 100
  });

});

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
