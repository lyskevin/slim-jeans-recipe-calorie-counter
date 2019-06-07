from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/recipe")
def home():
    return render_template("recipe.html")

@app.route("/contact")
def contact():
    return render_template("contact.html")
