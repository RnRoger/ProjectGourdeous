from flask import Flask, render_template, url_for, request, redirect
from  Gourdeous_textminer import connector,entrez_search,db_vullen
import time
from Bio import Entrez
from Bio import Medline
import urllib2
import mysql.connector
from flask import Flask
import MySQLdb as my
import sys

app = Flask(__name__)

@app.route('/')
def index():
    return redirect(url_for('home'))


@app.route('/home')
def home():
    return render_template('home.html')


@app.route('/textmine')
def textmine():
    return render_template('textmine.html')

@app.route('/Done', methods=['GET','POST'])
def submitter():
    #This function is meant to allow the user to add data in the form of search requests to the database
    # in order to expand the database.
    organisme = request.form['searchPlant']
    zoekwoord = request.form['searchHealth']
    email = request.form['searchMail']
    data = entrez_search(organisme,zoekwoord,email)
    con = connector()
    #return data
    db_vullen(data, organisme, zoekwoord, con)
    #Gourdeous_textminer.main(organisme, zoekwoord, email)
    return render_template("Done.html")



@app.route('/sunburst')
def sunburst():
    return render_template("sunburst.html")


@app.route('/help')
def helppage():
    return render_template("help.html")


@app.route('/cook')
def cook():
    return render_template("cook.html")


if __name__ == '__main__':
    app.run(debug=True)