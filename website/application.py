from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/index")
def home():
    return render_template("index.html")

@app.route("/contact")
def contact():
    return render_template("contact.html")
