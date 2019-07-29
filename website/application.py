import json
import sqlite3
import re

from datetime import datetime
from flask import (Flask, flash, g, jsonify, redirect, render_template,
                   request, session, url_for)
from functools import wraps
from os import path
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError, HTTPException
from werkzeug.security import check_password_hash, generate_password_hash

app = Flask(__name__)
app.secret_key = b'\x0e(\xfd$\x9a\xb1\xa3\xb1\xca\xefa#\xe7\x16\xfb\xa1'

ROOT = path.dirname(path.realpath(__file__))

""" Helper Functions """


"""@app.errorhandler(HTTPException)
def handle_http_exception(e):
    return render_template("error.html"), 200"""


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


@app.route("/get_all_recipe_data", methods=["GET", "POST"])
@login_required
def get_all_recipe_data():
    if request.method == "POST":
        username = session["username"]
        connection = sqlite3.connect(path.join(ROOT, "slim_jeans.db"))
        cursor = connection.cursor()
        recipes = cursor.execute("""SELECT * FROM recipes
                                 WHERE username = (?)""" ,
                                 (username,))
        list_of_recipes = []
        for recipe in recipes:
            list_of_recipes.append(recipe)
        return jsonify(list_of_recipes)
    else:
        return render_template("saved_recipes.html")


@app.route("/get_specific_recipe_data", methods=["GET", "POST"])
@login_required
def get_specific_recipe_data():
    if request.method == "POST":
        username = session["username"]
        recipe_name = request.get_json()["recipeName"]
        connection = sqlite3.connect(path.join(ROOT, "slim_jeans.db"))
        cursor = connection.cursor()
        cursor.execute("""SELECT * FROM recipes
                       WHERE username = (?) AND recipe_name = (?)""",
                       (username, recipe_name))
        data = cursor.fetchall()
        return json.dumps(data)
    else:
        return render_template("saved_recipes.html")


@app.route("/reinsert_recipe", methods=["GET", "POST"])
@login_required
def reinsert_recipe():
    if request.method == "POST":
        now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        data = request.get_json()
        username = session["username"]
        recipe_name = data["recipeName"]
        recipe = data["recipe"]
        calories = data["calories"]
        connection = sqlite3.connect(path.join(ROOT, "slim_jeans.db"))
        cursor = connection.cursor()
        cursor.execute("""INSERT INTO recipes
                       (username, recipe_name, recipe, calories, date_time)
                       VALUES(?, ?, ?, ?, ?)""",
                       (username, recipe_name, recipe, calories, date_time))
        connection.commit()
        connection.close()
        return json.dumps("success")
    return render_template("saved_recipes.html")


@app.route("/save_recipe", methods=["GET", "POST"])
@login_required
def save_recipe():
    if request.method == "POST":
        now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        data = request.get_json()
        username = session["username"]
        recipe_name = data["recipeName"]
        recipe = data["recipe"]
        calories = data["calories"]
        connection = sqlite3.connect(path.join(ROOT, "slim_jeans.db"))
        cursor = connection.cursor()
        exists = cursor.execute("""SELECT 1 FROM recipes
                WHERE username = (?) AND recipe_name = (?)""",
                (username, recipe_name)).fetchall()
        if (exists):
            return json.dumps("Recipe already exists!")
        else:
            cursor.execute("""INSERT INTO recipes
                    (username, recipe_name, recipe, calories, date_time)
                    VALUES(?, ?, ?, ?, ?)""",
                    (username, recipe_name, recipe, calories, now))
            connection.commit()
            connection.close()
            return json.dumps("Recipe saved")
    else:
        return render_template("calorie_counter.html")


@app.route("/change_password", methods=["GET", "POST"])
@login_required
def change_password():

    if request.method == "POST":
        form = request.form
        username = session["username"]
        old_password = form["old-password"]
        connection = sqlite3.connect(path.join(ROOT, "slim_jeans.db"))
        cursor = connection.cursor()
        cursor.execute("""SELECT * FROM users WHERE username = (?)""",
                       (username,))
        user_information = cursor.fetchall()
        if not check_password_hash(user_information[0][2], old_password):
            connection.close()
            flash("Old password does not match")
            return redirect("/settings")
        else:
            new_password = form["new-password"]
            hashed_password = generate_password_hash(new_password)
            cursor.execute("""UPDATE users SET password = (?) WHERE username = (?)""",
                           (hashed_password, username))
            connection.commit()
            connection.close()
            flash("Password changed")
            return redirect("/settings")

    else:
        return redirect("/settings")


@app.route("/delete_recipe_data", methods=["GET", "POST"])
@login_required
def delete_recipe_data():
    if request.method == "POST":
        data = request.get_json()
        username = session["username"]
        recipe_name = request.get_json()["recipeName"]
        connection = sqlite3.connect(path.join(ROOT, "slim_jeans.db"))
        cursor = connection.cursor()
        cursor.execute("""DELETE FROM recipes
                       WHERE username = (?) AND recipe_name = (?)""",
                       (username, recipe_name))
        connection.commit()
        return json.dumps("delete success")
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


@app.route("/error")
def error():
    return render_template("error.html")


@app.route("/saved_recipes")
@login_required
def saved_recipes():
    return render_template("saved_recipes.html")


@app.route("/graph_generator", methods=["GET", "POST"])
@login_required
def graph_generator():

    if request.method == "POST":
        recipe_count = request.data.decode("utf-8").replace('\"', '')
        connection = sqlite3.connect(path.join(ROOT, "slim_jeans.db"))
        cursor = connection.cursor()
        rows = None
        if recipe_count != "All":
            recipe_count = int(recipe_count)
            rows = cursor.execute("""SELECT * FROM recipes WHERE username = (?)
                                  ORDER BY date_time DESC
                                  LIMIT (?)""",
                                  (session["username"], recipe_count))
        else:
            rows = cursor.execute("""SELECT * FROM recipes WHERE username = (?)
                                  ORDER BY date_time DESC""",
                                  (session["username"],))
        dataset = []
        for row in rows:
            data = []
            data.append(row[3])
            data.append(row[4])
            dataset.append(data)
        connection.close()
        return jsonify(dataset)

    else:
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
            connection.close()
            return render_template("login.html")
        else:
            session["user_id"] = userInformation[0][0]
            session["username"] = userInformation[0][1]
            connection.close()
            return redirect("/")

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
        # TODO: Message flash that says registered?
        # TODO: Some other alternative feedback to indicate that registration was successful
        return redirect("/")

    else:
        return render_template("register.html")


@app.route("/settings")
@login_required
def settings():
    return render_template("settings.html")

