import json
import sqlite3
import re

from flask import (Flask, flash, g, jsonify, redirect, render_template,
                   request, session, url_for)
from functools import wraps
from os import path
from werkzeug.exceptions import BadRequest, NotFound
from werkzeug.security import check_password_hash, generate_password_hash

app = Flask(__name__)
app.secret_key = b'\x0e(\xfd$\x9a\xb1\xa3\xb1\xca\xefa#\xe7\x16\xfb\xa1'

ROOT = path.dirname(path.realpath(__file__))

""" Helper Functions """


@app.errorhandler(BadRequest)
def handle_bad_request(e):
    return "Bad Request!", 400


@app.errorhandler(NotFound)
def handle_not_found(e):
    return "Not Found!", 404


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is None:
            return redirect("/login")
        return f(*args, **kwargs)
    return decorated_function


@app.route("/search")
def search():
    regex = re.compile("[^a-zA-Z ]")
    query = regex.sub("", request.args.get("q")).split(" ")
    connection = sqlite3.connect(path.join(ROOT, "slim_jeans.db"))
    cursor = connection.cursor()
    ingredients = cursor.execute("""SELECT * FROM food
                                 WHERE UPPER(description) LIKE UPPER(?)
                                 ORDER BY description ASC""",
                                 ("%" + query[0].upper() + "%",))
    ingredient_list = []
    for ingredient in ingredients:
        description = ingredient[0].lower()
        description_contains_all_query_words = True
        for word in query:
            if word.lower() not in description:
                description_contains_all_query_words = False
                break
        if description_contains_all_query_words:
            ingredient_dictionary = {
                "description": ingredient[0],
                "weightInGrams": ingredient[1],
                "measure": ingredient[2],
                "energyPerMeasure": ingredient[3]
            }
            ingredient_list.append(ingredient_dictionary)
    connection.close()
    return jsonify(ingredient_list)

@app.route("/display_recipe_data", methods=["GET", "POST"])
@login_required
def display_recipe_data():
    if request.method == "POST":
        username = request.get_json()
        connection = sqlite3.connect(path.join(ROOT, "testrecipe.db"))
        cursor = connection.cursor()

        recipes = cursor.execute("""SELECT * FROM recipes
                                    WHERE username = (?)""" ,
                                    (username,))
        list_of_recipes = []
        for amazing_var_name in recipes:
            list_of_recipes.append(amazing_var_name)
        return jsonify(list_of_recipes)
    else:
        return render_template("saved_recipes.html")


""" Helper Functions """


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/calorie_counter")
def calorie_counter():
    return render_template("calorie_counter.html")


@app.route("/saved_recipes")
@login_required
def saved_recipes():
    return render_template("saved_recipes.html")


@app.route("/graph_generator")
@login_required
def graph_generator():
    return render_template("graph_generator.html")


@app.route("/login", methods=["GET", "POST"])
def login():

    session.clear()

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
            # TODO: Difference between render_template and redirect

    else:
        return render_template("login.html")


@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")


@app.route("/register", methods=["GET", "POST"])
def register():

    if request.method == "POST":
        form = request.form
        username = form["username"]
        hashed_password = generate_password_hash(form["password"])
        connection = sqlite3.connect(path.join(ROOT, "slim_jeans.db"))
        cursor = connection.cursor()
        try:
            cursor.execute("""INSERT INTO users
                           (username, password)
                           VALUES(?, ?)""",
                           (username, hashed_password))
            connection.commit()
        except sqlite3.IntegrityError:
            connection.close()
            flash("Username already in use")
            return render_template("register.html")

        connection.close()
        return redirect("/")
        # TODO: Remember session id

    else:
        return render_template("register.html")

@app.route("/settings")
@login_required
def settings():
    return render_template("settings.html")

