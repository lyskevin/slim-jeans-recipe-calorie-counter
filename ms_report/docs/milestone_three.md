# Milestone 3

**Proposed Level of Achievement:** Apollo 11

## 1. Overview

This is the final milestone. With that, this README will document

1. The features we implemented in our calorie counter webpage
2. The challenges we faced in implementing such features
3. The steps we took to overcome these challenges.
4. User testing and additional considerations taken

The site can be found at this [link](https://lyskevin.pythonanywhere.com)   .

## 2. Revamp of Site UI
The original design was a bit plain, so we decided to make some changes to the
site's UI.

<ol>

  <li>
    We removed the sidenav entirely as it only gave us issues viewing the
    platform on mobile, moving the sidenav links and elements to the topnav.
    This made it easier to view the website on mobile, such as the following:
    <br><br>
    <div class='wrapper-center'>
      <img src="../figures/ms3/mob_view.png" alt="typeahead gif">
    </div>
    <br>
  </li>

  <li>
    All images used are either our own, or images sourced from
    <a href='https://www.pexels.com/search/food/'>this website</a>.
  </li>
  <li>
    In general, the site looks more appealing to the eye.
  </li>
</ol>

## 3. Calorie Counter
This was already shown in the prototype to work, there are however, a few
aspects that we would like to talk about in this section.

### 2.1 `typeahead.js` technical details
The `typehead` box is actually just a wrapper in between each

### 2.2 `typeahead.js` bug
Unbeknownst to us, the prototype shown in Milestone Two had a rather annoying
bug that presented itself when one added rows to the calorie counter. In order
to do input validation, we forced the user to select options from the
drop-down menu, using Twitter's `typeahead.js`:

<div class="wrapper-center">
  <img src="../figures/ms3/typeahead_1.gif" alt="typeahead gif">
  <p>The recording software glitched a bit...</p>
</div>

If multiple rows were added at the start, and users tried to select options
from the drop-down menu, they would have to click multiple times in order to
select that item properly. If the item was far down the drop-down menu, the
menu would refresh and brought back to the first entry. This made a menu
with many entries and selecting an item far down the menu an exercise in
frustration.

<div class="wrapper-center">
  <img src="../figures/ms3/typeahead_2.gif" alt="typeahead 2 gif">
  <p>Five rows, so need to click five times</p>
</div>


<div class="todo">
  <p>TODO: How this was fixed</p>
</div>

### 2.3 Input Validation
A big part of simplifying the back-end was to restrict users in selecting
the ingredients. In order to do this, we simply made one of the fields
unselectable until the user clicked something from the drop-down menu, this
would trigger the `Please fill in all input fields` alert, forcing the user
to pick something from the drop-down menu.

### 2.4 Empty Rows
We received feedback that empty rows in the table would not allow the user to
submit the form using the "Analyze Calories" button. We originally forced the
user to fill in all input fields within the form in order to submit it using
a simple boolean check. We added in an additional `if` check to continue
processing the rest of the ingredients if an empty row was found.

```Javascript
if (!(description == "" && amount == "" && unit == "")) {
  :
}
```

... Which we can abstract into a function such as:

```Javascript
function isAnEmptyRow() {
  :
}
```

This seemed to work well without issues.

### 2.5 Piechart for Results
The calorie counter now displays a piechart, giving users at a glance which
ingredients contributes the most to the overall caloric amount. This fulfilled
one of the features we wanted to add to the website.

For this feature, we used the
[Google Chart's API](https://developers.google.com/chart/interactive/docs/gallery/piechart)
to render the chart.

```Javascript
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
```

## 3. User Accounts and Sign-ins
User Accounts and Sign-ins were a big part of how we implemented certain
functions within the webapp. Flask has a framework for User Accounts already
available.

### 3.1 Information Transfer
Passing username/passwords back and forth between the front and back-end was
done using HTTPS POST requests. We read that this is standard for web
security nowadays due to HTTPS encryption to prevent MiTM attacks.

### 3.2 Registration
While we initially intended to work with Firebase to do Google/Facebook
Sign-ins due to the ease of implementation and security in having established
third-parties handle authentications for us, 
we decided against this because we wanted to appreciate the
difficulty and security considerations with storing usernames, passwords
and doing secure serverside authentication, and how big of a topic it is in
web security.

We used Flask's [Werkzeug](https://pypi.org/project/Werkzeug/) library to
handle password hashing and salting. Hashing ensures that we do not store
passwords in plaintext, while salting ensures that similar passwords don't
result in the same hash. For example, I made two accounts with the following
usernames and passwords

```text
user        password
====================
hashed1     123456
hashed2     123456
```

The two passwords were hashed and salted to:

```text
hashed1:
pbkdf2:sha256:150000$QBDEP5Jn$3001b4fb44eeb17630b6d9a0089f9b883686bd6ea9a61cec1f8b1ae0ade8e05e

hashed2:
pbkdf2:sha256:150000$0o18iF5N$7c406da90ce724f65c896fe931f9bda806fb3f04b55e21d1f9f0f88488b47385
```

... making it more secure. In the back-end, our code is simply -

```Python
hashed_password = generate_password_hash(form["password"])
```

### 3.3 Logins
Logins were simple. We simply sent the username and password back to the
back-end, and uses Werkzeug's `check_password_hash()` function to check if the
given password matched the hashed password in our database. If it matches,
it logs the user in and redirects the user to the front-page.

```Python
if request.method == "POST":
    form = request.form
    username = form["username"]
    password = form["password"]
    connection = sqlite3.connect(path.join(ROOT, "slim_jeans.db"))
    cursor = connection.cursor()
    cursor.execute("""SELECT * FROM users WHERE username = (?)""",
                    (username,))
    userInformation = cursor.fetchall()
    if len(userInformation) < 1 or \
        not check_password_hash(userInformation[0][2], password):
        flash("Invalid username and/or password")
        return render_template("login.html")
    else:
        session["user_id"] = userInformation[0][0]
        session["username"] = userInformation[0][1]
        return redirect("/")
else:
    return render_template("login.html")
```

### 3.4 Session ID
<!-- Please explain this section -->
  

## 4 Saving Recipes to Database
This feature was annoying and frustrating to implement, mostly due to the
handling of events by the Display and Delete buttons. Majority of the problems
faced were due to `async` on the front-end, rather than the back-end.

### 4.1 Front-end
We had a few versions of this page using vanilla Javascript. But this proved
to be very time-consuming and frustrating to work with. In the end, we ended up
going with the [DataTables](https://datatables.net/)
library, which allowed us to more easily create a table with additional
functionality, that also allowed styling via Bootstrap.

The table displays the **recipe name** and **number of calories** of each recipe
stored into the user account using the calorie counter. We give the users
two additional functionality in the form of two buttons in each row:

<div class="md-typeset__scrollwrap">
  <div class="md-typeset__table">
    <table>
      <thead>
        <tr>
          <th align="center">Button</th>
          <th align="center">Function</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="button1" align="center">
            <button class='btn btn-block btn-primary btn-sm'>Delete</button>
          </td>
          <td align="left">
            Shows more information abouyt the recipe. This uses DataTable's
            <a href="https://datatables.net/examples/api/row_details.html">child rows</a>
            API, where more information can be dynamically inserted into the
            table
          </td>
        </tr>
        <tr>
          <td class="button2" align="center">
            <button class='btn btn-block btn-danger btn-sm'>Delete</button>
          </td>
          <td align="left">
            Deletes the recipe from the table (and database). While DataTable's
            does offer an API to delete rows from the table, we needed to
            handle reinserting the same row into the table for the "Undo"
            feature ourselves.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

#### "Delete"
The "delete" functionality posed some challenges for us. First, `ajax` requests
are asynchronous, and so making an `ajax` call every time the user deletes
something caused some problems with the code (functions not returning until
`ajax` request has finished, causing `null` in some variables, etc). So, we
ended up storing the names of the recipes that were to be deleted in an
array (a "fake" delete, as it were), and executing an `ajax` request to delete
all the recipes from the database once the page is unloaded.

```Javascript
$(window).on('unload', function() {
  for (let key in toDelete) {
    $.ajax("/delete_recipe_data", {
      type: 'POST',
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({
        "recipeName": toDelete[key]
      })
    });
  }
});
```

It also turned out that doing this method made the `undo` button easier to
implement as well.

### 4.2 Undo Functionality
We felt that an `undo` option is very important for users. This is from
experience of frequently using `Ctrl-Shift-T` to reopen closed tabs on browsers,
or `Ctrl-Z` in most programs. We used Bootstrap alerts to create a way for
users to "Undo" a delete they may have accidentally clicked:

<div class="alert alert-warning alert-dismissible fade show" role="alert">
  Deleted "recipe_name".
  <button type="button" class="btn btn-link btn-sm">
    Undo
  </button>
  <button type="button" class="close" data-dismiss="alert" aria-label="Close">
    <span aria-hidden="true">&times;</span>
  </button>
</div>

The `undo` button's event was handled by jQuery

```Javascript
/**
 * Function to handle undo event for a specific recipe.
 * @param {string} recipeName - name of recipe associated with this button
 * @param {object} recipes - list of all recipes and their data
 */
function handleUndoOnClick(recipeName, recipes) {
  $(document).on('click', '#undo-'
      + replaceSpacesWithUnderscores(recipeName), function() {
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
```

This allows the users to Undo the delete if it was by accident, or if the user
had a change of heart.

### 4.3 Back-end
Flask has a `jsonify()` method to pass JSON objects back to the
front-end Javascript. Conversely, Javascript's jQuery has the ability to make
an `ajax` request to the Python back-end to send data back. This is how the
front-end communicates with the SQL database in the back-end. So, to send
data back to the back-end, an `ajax` request may look something like this:

```Javascript
const data = ...; // recipe data goes here
$.ajax("/func_name", {
    type: "POST",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify(data)
}).done(() => {
  // do something after function returns
})
```

When the Python function returns from the back-end, `.done()` is used to
continue the running of the Javascript after the `ajax` request is finished.

In the back-end, the Python function looks like:

```Python
@app.route("/func_name", methods=["GET", "POST"])
@login_required
def func_name:
  if request.method == "POST":
      # make SQL requests and deletes from database
  else:
      return render_template("my_page.html")
```

Due to the way we delete recipes form the database, we do not allow
duplicate recipe names inside the database. This is done using an SQL
`SELECT` first:

```Python
exists = cursor.execute("""SELECT 1
                           FROM recipes
                           WHERE username = (?) AND recipe_name = (?)""",
                           (username, recipe_name)).fetchall()
```

Then check `if (exists)`

```Python
if (exists):
    return json.dumps("Recipe already exists")
else:
    cursor.execute("""INSERT INTO recipes
                      (username, recipe_name, recipe, calories)
                      VALUES(?, ?, ?, ?)""",
                      (username, recipe_name, recipe, calories))
    connection.commit()
    connection.close()
    return json.dumps("Recipe saved")
```



## 5. Night Mode

## 6. User Testing
We gave it to a few friends and family members who actually cook and see if
they liked the features. This is what we have obtained

<!-- I tried it myself on a Nikujaga recipe lol -->



## 7. Conclusion of the Project
We would say that we have learnt greatly from Orbital, particularly the
many APIs and frameowrks (and lack thereof) we have had the pleasure of using,
such as Flask, Jinja2, SQLite, etc and the other technologies such as HTML5,
CSS and native Javascript.

Doing this project using native Javascript has
also allowed us to appreciate new web frameworks such as React,
Vue or Angular that abstracts the nitty-gritty of direct DOM
manipulation and state changes. Even trying to creat and insert a table
into a webpage is long-winded and cumbersome to do!

No matter what level of achievement we end up obtaining for Orbital, this
has been a fruitful and memorable project.

## Project Log
Our project log is documented
[in this Google Sheet](https://docs.google.com/spreadsheets/d/17kEtNaCyYZzXc2UWd6ss4zXTWQ4-QY7XN3ODB6DpEJs/edit?usp=sharing)
