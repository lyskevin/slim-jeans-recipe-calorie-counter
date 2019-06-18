# Has to be run in the static directory

import csv, sqlite3

connection = sqlite3.connect("food.db")
cursor = connection.cursor()
cursor.execute("CREATE TABLE IF NOT EXISTS food (householdWeight1 REAL, householdWeight1Description VARCHAR(255), householdWeight2 REAL, householdWeight2Description VARCHAR(255), description VARCHAR(255));")

with open('food.csv', 'r') as file_in:
    dict_reader = csv.DictReader(file_in)
    to_db = [(column['1st Household Weight'], column['1st Household Weight Description'], column['2nd Household Weight'], column['2nd Household Weight Description'], column['Description']) for column in dict_reader]

cursor.executemany("INSERT INTO food (householdWeight1, householdWeight1Description, householdWeight2, householdWeight2Description, description) VALUES (?, ?, ?, ?, ?);", to_db)
connection.commit()
connection.close()
