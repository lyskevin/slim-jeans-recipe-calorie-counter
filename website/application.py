from flask import Flask, render_template

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
