# Milestone 2
*Updated as of 30th June 2019, 5:30pm*

**Proposed Level of Achievement:** Apollo 11

## 1. Overview
As opposed to what was proposed in Milestone One, are using a mix of:

* **HTML/CSS** and **Javascript** for the front-end
* **Python** using the **Flask** back-end framework
* **SQL** to store the nutritional information of various foods
  * Data is obtained from [USDA](https://ndb.nal.usda.gov/ndb/)

The big overview is the front-end JS communicates with the Python backend,
the Python then makes a query to the SQL database and returns the relevant
information, which is then passed back to the front-end to display to the
user.

## 2. Front-end

### 2.1 HTML/CSS and Javascript

We decided not to go with any Javascript frameworks as we had a lot of
difficulties integrating Flask with any framework such as `React` or `Node`.
Thus, we decided to go with stock JS for our front-end.

The actual logic in displaying the calories is quite simple, all it does is
insert HTML into the website when the information is returned to Javascript
after Flask returns the information it gets from the SQL database.

Calculating the number of calories was more difficult than expected. We wanted
the user to be able to input any (appropriate) type of measurement for any
ingredient in the database, so if one needed some sweetened condensed milk
in your recipe, they could add any amount they like (tbsp, tsp, cup, ...).
This required us to exhaust every possible case for unit conversion.

There were a very large number of units of measurement, such as *grams*,
*pounds*, *fluid ounce*, *cups*, etc and items such as avocadoes had very
weird measurements such as *cup, whole, without pits* and
*cup, quartered or chopped*. This made it very difficult to accurately
calculate the number of calories as we needed to convert the user input
information into a standard unit, then perform arithmetic to get the result.

We split the ingredients into two main categories: mass and volume ingredients.

#### Mass Ingredients

This included ingredients such as chicken breast, pork loin, steak, lamb
chops, etc i.e any ingredient whose caloric information is defined in terms
of *grams*. This was much simpler than volume, we simple converted from
whatever mass unit was given, into grams, then ran it through the database
to return the number of calories.

#### Volume ingredients

Since the amount of ingredients you could use in a recipe is very varied, we
could notlimit the user to use big, simple measurements such as *cups* or
*litres* only,
we had to accommodate for *tsp* or *tbsp* as well. We settled on a conversion
table:

|starting unit|cup|tbsp|tsp|litre|millilitre|pint|fl oz|
|:--|:--|:--|:--|:--|:--|:--|:--|
|1 cup|1|16|48|0.236588|236.588|0.5|8|
|1 tbsp|0.0625|1|3|0.0147868|14.7868|0.03125|0.5|
|1 tsp|0.0208333|0.333333|1|0.00492892|4.92892|0.0104167|0.166667|
| *... etc*


### 2.2 Python and Jinja2

While Flask was primarily used for the back-end, it was still useful to us
in the front-end, primarily for *HTML reusability*.

For example, we have a layout of the website that contains the sidenav, topnav,
relevant stylesheets and icons, etc. that are present across all pages. Using
Flask, we are able to create a template for each page using a `layout.html`
file. Common elements across webpages were easier to reuse in
other webpages without having to copy the code, by specifying a line in the
preamble such as

```text
{% extends layout.html %}
```

Flask also allowed us to use Python code to dynamically generate HTML
elements within each HTML file. This was done using codeblocks such as:

```text
{% for i in range(x,y) %}

    // insert HTML here

{% endfor %}
```

This does exactly what one might expect.

### 2.3 Autocomplete using `typeahead.js`

To avoid cases where the user inputs any ingredient other than those found in
the database, the site features an autocomplete system that forces users to
only input ingredients that are found in the database. This is was done
using an open-source API: 
[typeahead.js](https://github.com/twitter/typeahead.js)
provided by Twitter.

Whenever a character is typed into an input field, the website makes a request
to the back-end database and finds all entries that match what the user
has typed, and returns a dropdown menu containing all relevant entries. As the
user types more characters, the search narrows to more relevant entries.

We had some issues in relation to data processing: the data provided by the
USDA is named in a such a way that is common to logistics, but a pain to
manage in code. For example, "Fuji Apple" may be named "Apple, Fuji". Thus,
we cannot use any `substring` methods of searching.

The method we used to overcome this limitation is to
retrieve all entries that match the first word, then retrieve all sub-entries
that contain every subsequent word in the query, which are the results displayed
in the resulting dropdown box.

One important point of note is that we force the user to pick one of the
ingredients from the drop-down menu. This is to prevent any entries of 
ingredients that are not inside the database.

## 3. Back-end

### 3.1 Python and Flask

As stated earlier, the primary framework used in the back-end is Python's
**Flask** framework.

We used Flask to render different HTML templates based on the route chosen.
For instance, the home page results in "index.html" being loaded onto the user's
screen, and the calorie counter page serves `calorie_counter.html`.

Flask enables us to use Python code to handle back end logic such as the
establishing a connection to the database and executing SQL commands from there.
Also, Python's wide variety of libraries contain code abstractions which allow us to
focus more on what we want to implement instead of how we want to do it. Finally,
we plan to use additional Python libraries to implement Milestone Three features
such as graph generation for users.

### 3.2 SQL and Database

The database took up the brunt of the work for the project. The
[USDA](https://ndb.nal.usda.gov/ndb/)
provides a big list of caloric and nutritional information on many common
foods in the United States that is still relevant to the Singapore context,
although it might not have foods such as Bak Chor Mee or Chee Cheong Fun.

Fortunately, the USDA allows its information to be freely used, and allows the
public to download the data into a compact `.csv` file. The data contains about
7500 entries on different foods as documented by the USDA. We trimmed
down the data of all the nutritional information and only focused on the
number the calories of each ingredient. Conveniently, each entry also came with
the amount of calories per unit measure, allowing us to have an easier
time managing the data to output to the webpage.

The management of the data in the calculating of the final result was
discussed in the [previous section](#21-htmlcss-and-javascript).

Using Flask, we were able to use Python to query the database using SQL
language and return it to the front-end Javascript using the `jsonify()`
method. From there, the data is directly handled by the Javascript.

### 3.3 JQuery

JQuery's main use is in DOM traversal and manipulation, thus it is used everywhere in the project.
We haven't encountered any issues with JQuery thus far.

## 4. Addressing Some Concerns

We read through the feedback from Milestone One, and we would like to address
some of the important issues that were brought up.

---

> Would the user have to obtain recipes of every food item they consume?

We are actually targetting those who are cooking or looking up recipes to track
what they are eating. It is also very difficult to determine how many calories
go into a specific meal from a specific restaurant/food court. Thus, we have
decided that this feature is not practical to implement.

---

> Could you use Natural Language Processing techniques to extract relevant
> data from copy-pasted recipe text? Instead of using drop-down menus.

This was heavily considered after we read it. We decided to search up
Natural Language Processing APIs, and those that we found that are specific to
food are usually licensed and required payment (For one API that we found,
the entry-level API package is USD300 per month!). The free versions did not
have the required features for our
implementation either. We also determined that writing our own Natural
Language Processing engine would be extremely difficult for our skill
level and is impractical for a three month long project.

---

> Why do we need Facebook and Google sign-ins?

The main reason is to personalise the way that we deliver nutritional
information to the user. For example, in Milestone One, we planned to implement
a feature by Milestone Three that shows personalised content to each user,
such as caloric in-take over a certain time period. This would be done using
user accounts.

As for why we planned to use Facebook/Google sign-in over handling user
account info ourselves: we planned to use Facebook/Google sign-in as it is more
convenient, and is safer in terms of web security, to allow an established
third-party to handle user accounts and passwords for us.

---

> Food Recommendation criticisms (Feature four)

The original intention of this feature was in relation to the previous
point, where we would be tracking caloric intake over the day. So if one
had 800 calories left for the day, the program could supply an example recipe
in the ballpark of 800 calories. From the feedback, we realise that implementing
this feature may be difficult and not a priority. Thus, this feature is a KIV,
but likely will not be implemented.

## 5. Plans for Refinement

* Better UI

  The current UI is decent, but a bit plain. We hope to make it more
  appealing to the eye.

* Greater Web Security

   As this is a prototype, more focus was made on getting the result to
   display on the webpage.

* Caloric Breakdown for each ingredient (such as pie chart)

  This extends the result of the calorie analyzation. Instead of just
  returning the calories, the app could return a breakdown of how much
  each ingredient contributes to the overall recipe.

* Caloric Graphs for each User Account 
  
... And all those mentioned in Milestone One

## 6. Project Log

As per Milestone One, the hours we spent on this project is documented
[in this Google Sheet](https://docs.google.com/spreadsheets/d/17kEtNaCyYZzXc2UWd6ss4zXTWQ4-QY7XN3ODB6DpEJs/edit?usp=sharing)
