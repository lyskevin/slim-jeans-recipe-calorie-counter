
# Milestone 2

**TODO BY July 1**

## How does it work?
As opposed to what was proposed in Milestone One, are using a mix of:

* **HTML/CSS** and **Vanilla Javascript** for the front-end
* **Python** using the `Flask` back-end framework
* **SQL** to store the nutritional information of various foods
  * Data is obtained from [USDA]()

### Front-end

#### HTML and CSS

#### Javascript

We decided not to go with any Javascript frameworks as we had a lot of
difficulties integrating `Flask` with any framework such as `React` or `Node`.
Thus, we decided to go with vanilla JS, along with HTML and CSS above,
for our front-end.

Much of the logic is quite simple as the website currently does not have much.
We have a few different functions to 

#### Python

While `Flask` was primarily used for the back-end, it was still useful to us
in the front-end. This is due to *HTML reusability*. A prime example
of this is with the layout of the website. Using `Flask`, we are able to
create templates for each page using a `layout.html` file. Elements such
as the sidenav, topnav, stylesheets, etc were easy to import into the
other webpages without having to copy the code, by specifying a line in the
preamble such as

```text
{% extends layout.html %}
```

`Flask` also allowed us to use Python code to dynamically generate HTML
elements within each HTML file. Using codeblocks such as

```text
{% for i in range(x,y) %}

{% endfor %}
```
... that do exactly what you would expect.

We thus, found the use of Python and `Flask` to be very useful in designing
our webpages

### Back-end

#### Python and Flask

#### Jinja2

#### JQuery
