import json
import psycopg2
import os

# Function to insert JSON data into PostgreSQL table
def insert_json_data(file_path, conn):
    # Open your JSON file
    with open(file_path, 'r') as file:
        json_data = json.load(file)

    # Convert your JSON object to a string
    json_str = json.dumps(json_data)

    # Create a cursor object
    cur = conn.cursor()

    # Check if the JSON data already exists in the table
    cur.execute("SELECT COUNT(*) FROM regression_model WHERE data = %s", [json_str])
    print(file_path)
    result = cur.fetchone()

    # If the JSON data does not exist, insert it
    if result[0] == 0:
        cur.execute("INSERT INTO regression_model (data) VALUES (%s)", [json_str])
        conn.commit()

    # Close the cursor
    cur.close()

# Establish a connection to your PostgreSQL database
conn = psycopg2.connect(
    dbname="modelpredictdb",      # Replace with your database name
    user="rohithgupthakona",          # Replace with your PostgreSQL user
    password="root",  # Replace with your PostgreSQL password
    host="localhost",         # Replace with your host, typically localhost
    port="5432"               # Replace with your port, typically 5432
)

directory_path = os.getcwd() + "/model/data/HomeLob/"  # Ensure the path is correct

# Loop through each file in the directory
for filename in os.listdir(directory_path):
    if filename.endswith('.json'):
        file_path = os.path.join(directory_path, filename)

        # Insert the JSON data into the PostgreSQL table
        insert_json_data(file_path, conn)

# Close the connection
conn.close()
