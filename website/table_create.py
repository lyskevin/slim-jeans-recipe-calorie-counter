import csv, sqlite3

connection = sqlite3.connect("food.db")
cursor = connection.cursor()
cursor.execute("CREATE TABLE IF NOT EXISTS food (description VARCHAR(255), weightInGrams REAL, measure VARCHAR(255), energyPerMeasure INTEGER);")

with open('download.csv', 'r') as file_in:
    dict_reader = csv.DictReader(file_in)
    to_db = [(column['Description'], column['Weight(g)'], column['Measure'], column['Energy(kcal)Per Measure']) for column in dict_reader]

cursor.executemany("INSERT INTO food (description, weightInGrams, measure, energyPerMeasure) VALUES (?, ?, ?, ?);", to_db)
connection.commit()
connection.close()

