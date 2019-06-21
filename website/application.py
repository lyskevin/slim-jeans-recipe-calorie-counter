import sqlite3
from flask import Flask,jsonify, render_template, g, request

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/calorie_counter")
def calorie_counter():
    return render_template("calorie_counter.html")

@app.route("/daily_goals")
def daily_goals():
    return render_template("daily_goals.html")

@app.route("/graph_generator")
def graph_generator():
    return render_template("graph_generator.html")

@app.route("/settings")
def settings():
    return render_template("settings.html")

@app.route("/about")
def abotu():
    return render_template("about.html")

@app.route("/contact")
def contact():
    return render_template("contact.html")

@app.route("/search")
def search():
    query = ("%" + request.args.get("q") + "%").upper()
    connection = sqlite3.connect("static/food.db")
    cursor = connection.cursor()
    ingredients = cursor.execute("""SELECT description FROM food
                                 WHERE UPPER(description) LIKE UPPER(?)
                                 ORDER BY description ASC
                                 LIMIT 10""", (query,))
    ingredient_list = []
    for ingredient in ingredients:
        ingredient_list.append(ingredient[0])
    return jsonify(ingredient_list)

