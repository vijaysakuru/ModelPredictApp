# Description 
Developed a full-stack application using Python for the backend and React for the frontend.
Implemented advanced machine learning models to analyze and predict insurance data.
Developed interactive UI components to visualize and handle data interactions.

# Backend
    pip install -r requirements.txt
    
    flake8 .

    python manage.py makemigrations
    python manage.py migrate

    python upload_json.py

    python manage.py runserver
    
### Admin
    python manage.py createsuperuser 


# Frontend
    npm install 

    npm install eslint prettier eslint-plugin-react eslint-config-prettier eslint-plugin-prettier --save-dev

    npm start

# PostgreSQL
    psql -U rohithgupthakona -d modelpredictdb -h localhost
    \dt
    \d regressionModel
    select * from regressionModel;
