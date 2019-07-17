# Milestone 3

**Proposed Level of Achievement:** Apollo 11 (w/o Mentor).

## 1. Table of Contents <a name="toc"></a>
1. [Table of Contents](#toc)
2. [Site Design Revamped](#revamp)
3. [Calorie Counter](#ccounter)
4. [User Accounts](#useracc)

## 2. Site Design Revamped <a name="revamp"></a>
We realised that the original design was a bit plain, so we decided to make
some changes to the site's UI.

1. We removed the sidenav entirely as it only gave us issues viewing the
   platform on mobile, moving the sidenav links and elements to the topnav
2. All images used are either our own, or images sourced from this website
   [this website](https://www.pexels.com/search/food/). We are actually unsure
   if we are legally allowed to use these photos.
3. In general, the site looks more appealing to the eye.

## 3. Calorie Counter <a name="ccounter"></a>
This was already shown in the prototype to work, there are however, a few
aspects that we would like to talk about in this section.

### 3.1 `typeahead.js` bug
Unbeknownst to us, the prototype shown in Milestone Two had a rather annoying
bug that presented itself when one added rows to the calorie counter. In order
to do **input validation**, we forced the user to select options from the
drop-down menu, using Twitter's `typeahead.js`:

<!-- insert image showing drop-down menu-->

If multiple rows were added at the start, and users tried to select options
from the drop-down menu, they would have to click multiple times in order to
select that item properly. If the item was far down the drop-down menu, the
menu would refresh and brought back to the first entry. This made a menu
with many entries and selecting an item far down the menu an exercise in
frustration.

<!-- add how the bug was fixed -->

### 3.2 Input Validation

### 3.3 Empty Rows
We received feedback that empty rows in the table would not allow the user to
submit the form using the "Analyze Calories" button. We originally forced the
user to fill in all input fields within the form in order to submit it using
a simple boolean check. We added in an additional `if` check to continue
processing the rest of the ingredients if an empty row was found.

```Javascript
if (description == "" && amount == "" && unit == "") {
  continue;
}
```

### 3.4 Additional Functionality

#### 3.4.1 Piechart
The calorie counter now displays a piechart, giving users at a glance which
ingredients contributes the most to the overall caloric amount. This fulfilled
one of the features we wanted to add to the website.

#### 3.4.2 Saving Recipes to Cloud/Locally
<!-- add when we develop this feature -->


## 4. User Accounts and Sign-ins <a name="useracc"></a>

<!-- add how user accounts were added -->

## 5. Conclusion of the Project
We took Orbital mainly as a learning experience in web development, not
particularly to make a spectacular app that would be used by many.

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
