import json
import sqlite3
import re

from flask import (Flask, flash, g, jsonify, redirect, render_template,
request, session, url_for)
from os import path
from werkzeug.security import check_password_hash, generate_password_hash

app = Flask(__name__)
app.secret_key = b'\x0e(\xfd$\x9a\xb1\xa3\xb1\xca\xefa#\xe7\x16\xfb\xa1'

ROOT = path.dirname(path.realpath(__file__))

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/calorie_counter")
def calorie_counter():
    return render_template("calorie_counter.html")

@app.route("/daily_goals")
def daily_goals():
    return render_template("daily_goals.html")

@app.route("/graph_generator")
def graph_generator():
    return render_template("graph_generator.html")

@app.route("/login", methods=["GET", "POST"])
def login():

    #session.clear()

    if request.method == "POST":
        form = request.form
        print(form["username"])
        print(form["password"])
        return redirect("/")
    
    else:
        return render_template("login.html")

@app.route("/register", methods=["GET", "POST"])
def register():

    if request.method == "POST":
        form = request.form
        username = form["username"]
        hashed_password = generate_password_hash(form["password"])
        connection = sqlite3.connect(path.join(ROOT, "slim_jeans.db"))
        cursor = connection.cursor()
        try:
            with connection:
                connection.execute("""INSERT INTO users
                                   (username, password)
                                   VALUES(?, ?)""",
                                   (username, hashed_password))
        except sqlite3.IntegrityError:
            flash("Username already in use")
            return render_template("register.html")
        return render_template("index.html")

    else:
        return render_template("register.html")

    return render_template("register.html")

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

@app.route("/settings")
def settings():
    return render_template("settings.html")

