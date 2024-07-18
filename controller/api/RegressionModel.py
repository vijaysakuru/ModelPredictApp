import os
import json
import joblib
import pandas as pd
import numpy as np
import matplotlib
import matplotlib.pyplot as plt
from .models import RegressionModel
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import r2_score,  mean_absolute_error, mean_squared_error
matplotlib.use('Agg')

def Predict(model_type, target_file, expectedTotalPremium_directory, action, conn):
    try:
        featureData = preprocess()

        X_featureData = featureData.drop('Total Final Premium', axis=1)
        Y_featureData = featureData['Total Final Premium']

        model, X_test, Y_test = train_model(X_featureData, Y_featureData, model_type, action)
        
        # Read the JSON file into a JSON object       
        json_data = json.load(target_file)
     
        try:
            current = json_data["Total Final Premium"]
            del json_data["Total Final Premium"]
        except KeyError:
            current = "Not present in Input"
          
        # Convert JSON data to DataFrame
        test_data = pd.DataFrame(json_data, index=[0])

        # Assuming df_predict is your prediction data and df_test is your test data
        df_predict_aligned = test_data.reindex(columns=X_featureData.columns, fill_value=0)

        # # Assuming 'test_data_reindexed' is a DataFrame containing your test data
        df_predict_aligned = df_predict_aligned.replace('\$', '', regex=True).replace(',', '', regex=True).astype(float)          

        y_true = Y_test
        y_pred = model.predict(X_test)

        y_true_array = np.array(y_true)
        y_pred_array = np.full(y_true_array.shape, y_pred)       

        # Calculate the metrics
        score = abs(r2_score(y_true_array, y_pred_array))
        mae = mean_absolute_error(y_true_array, y_pred_array)            
        mse = mean_squared_error(y_true_array, y_pred_array)
        rmse = np.sqrt(mse)
        model_score = model.score(X_test,Y_test)

        expectedTotalPremium_directory = os.getcwd() + expectedTotalPremium_directory;

        model_score_graph(model, X_test, Y_test, expectedTotalPremium_directory)

        R2_graph(score, expectedTotalPremium_directory)

        predicted_premium = model.predict(df_predict_aligned)

        json_data['Total Final Premium'] = f'${predicted_premium[0]:.2f}'   

        new_dftest_data = pd.DataFrame(list(json_data.items()), columns=['Coverage', 'Cost'])
        
        if(action == "trainAndTestModel") :
            feature_graph_train(new_dftest_data, expectedTotalPremium_directory)
        else :
            feature_graph_preferred(new_dftest_data, expectedTotalPremium_directory)

        expected = json_data["Total Final Premium"]

        # In Train and Test Model option the input data and predicted output are added into database for the next iteration
        if action == "trainAndTestModel":
            cur = conn.cursor()
            if 'Base Premium' in json_data:
                del json_data['Base Premium']
            json_str = json.dumps(json_data)
            cur.execute("SELECT COUNT(*) FROM regression_model WHERE data = %s", [json_str])
            result = cur.fetchone()
            if result[0] == 0:
                cur.execute("INSERT INTO regression_model (data) VALUES (%s)", [json_str])
                conn.commit()
            cur.close()

        return current, expected, model_score, mae, mse, rmse, json_data, score
        
    except Exception as e:
        print(f'An error occurred: {e}')

def preprocess():
    # Fetch JSON data from the database using Django ORM
    json_data_objects = RegressionModel.objects.all()

    # Extract JSON data
    Data = [obj.data for obj in json_data_objects]

    # Iterate through each dictionary in the list
    for entry in Data:
        if 'Total Final Premium' in entry and 'Base Premium' in entry:
            # If both 'Total Final Premium' and 'Base Premium' exist, remove 'Base Premium'
            del entry['Base Premium']
        elif 'Base Premium' in entry:
            # If only 'Base Premium' exists, rename it to 'Total Final Premium'
            entry['Total Final Premium'] = entry.pop('Base Premium')

    # Convert JSON data to a DataFrame
    featureData = pd.DataFrame(Data).replace('\$', '', regex=True).replace(',', '', regex=True).astype(float)
    
    featureData = featureData.fillna('0.0')
    
    featureData = featureData[(pd.to_numeric(featureData['Total Final Premium']) != 0) & (pd.to_numeric(featureData['Total Final Premium']) <= 100000)]

    # Reset index after filtering
    featureData.reset_index(drop=True, inplace=True)

    return featureData

def train_model(X_featureData, Y_featureData, model_type, action):
    X_train, X_test, Y_train, Y_test = train_test_split(X_featureData, Y_featureData, test_size=0.2, random_state=42)
    
    # models = {
    #     'linearRegression': LinearRegression(),
    #     'ridgeRegression': Ridge(),
    #     'lassoRegression': Lasso(),
    #     'randomForest': RandomForestRegressor(),
    #     'gradientBoosting': GradientBoostingRegressor()
    # }

    # # Train and save each model, return only the requested model
    # for key, model in models.items():
    #     model.fit(X_train, Y_train)
    #     model_filename = os.getcwd() + f'/api/check/{key}_model.pkl'
    #     joblib.dump(model, model_filename)
    #     print("Hello in here")

    # Create a new Regression model for training and testing the input data.
    if action == 'trainAndTestModel':
        if model_type == 'linearRegression':
            model = LinearRegression()
        elif model_type == 'ridgeRegression':
            model = Ridge()
        elif model_type == 'lassoRegression':
            model = Lasso()
        elif model_type == 'randomForest':
            model = RandomForestRegressor()
        elif model_type == 'gradientBoosting':
            model = GradientBoostingRegressor()
        else:
            raise ValueError("Invalid model type selected")
        
        model.fit(X_train,Y_train)
        return model, X_test, Y_test
    
    # Load the pre-trained model
    else:
        try: 
            model_filename = os.getcwd() + f'/api/preTrainedModels/{model_type}_model.pkl'   
            model = joblib.load(model_filename)
            return model, X_test, Y_test
        except:
            raise FileNotFoundError(f"No pre-trained model found for {model_filename}. Please train it first.")

# Method to plot model score graph
def model_score_graph(model, X_test, Y_test, expectedTotalPremium_directory):
    plt.figure(figsize=(10, 6))
    bars = plt.bar(['Model Score'], [model.score(X_test,Y_test)]) 
    plt.title('Model Score ')
    plt.ylabel('Value')
    plt.xticks(np.arange(0, 1, step=.5))  

    for bar in bars:
        height = bar.get_height()
        plt.text(bar.get_x() + bar.get_width() / 2, height, f'{height:.4f}', ha='center', va='bottom')

    plt.savefig(f'{expectedTotalPremium_directory}ModelScore.png')

# Method to plot R2 Graph
def R2_graph(score, expectedTotalPremium_directory):
    plt.figure(figsize=(10, 6))
    bars = plt.bar(['R2 Score'], [score])
    plt.title('R2 Score Visualization')
    plt.ylabel('Value')

    for bar in bars:
        height = bar.get_height()
        plt.text(bar.get_x() + bar.get_width() / 2, height, f'{height:.4f}',
                 ha='center', va='bottom')  # Ensure text is above the bar

    plt.savefig(f'{expectedTotalPremium_directory}/R2_Score.png')

# Method to plot Feature Graph
def feature_graph_preferred(new_dftest_data, expectedTotalPremium_directory):
    plt.figure(figsize=(12, 8))  # Setting the figure size

    # Convert 'Cost' data for plotting, ensuring removal of formatting characters
    new_dftest_data['Cost'] = new_dftest_data['Cost'].replace({'\$': '', ',': ''}, regex=True).astype(float)
    
    # Create the bar plot
    bars = plt.bar(new_dftest_data['Coverage'], new_dftest_data['Cost'], color=['black', 'red', 'green', 'blue', 'cyan', 'magenta', 'yellow', 'gray', 'orange', 'purple', 'brown'])

    # Set the title and labels with specific fonts and sizes
    plt.title('Coverage Costs', fontsize=16, fontweight='bold')
    plt.xlabel('Coverage', fontsize=14, fontweight='bold')
    plt.ylabel('Cost', fontsize=14, fontweight='bold')

    # Rotate x-axis labels for better readability
    plt.xticks(rotation=45, ha='right', fontsize=12)

    # Adding text labels to the bars
    for bar, value in zip(bars, new_dftest_data['Cost']):
        plt.text(bar.get_x() + bar.get_width() / 2, bar.get_height(), f'${value:,.2f}', 
                 ha='center', va='bottom', color='dimgrey', fontsize=10)

    plt.tight_layout()  # Adjust layout to fit everything neatly
    plt.savefig(f'{expectedTotalPremium_directory}/FeaturePredictedValues.png', dpi=100)  # Save the figure
    plt.close()  # Close the plot to free up memory

def feature_graph_train(new_dftest_data, expectedTotalPremium_directory):
    # Set the figure size and define colors once
    plt.figure(figsize=(12, 8))
    colors = ['g', 'r', 'c', 'm', 'y', 'k']

    # Convert 'Cost' to float and remove '$' and ',' using regex directly in the DataFrame call
    new_dftest_data['Cost'] = new_dftest_data['Cost'].replace({'\$': '', ',': ''}, regex=True).astype(float)

    # Plot bars
    bars = plt.bar(range(len(new_dftest_data['Coverage'])), new_dftest_data['Cost'], color=colors)
    plt.title('Coverage Costs', fontsize=16)
    plt.xlabel('Coverage', fontsize=14)
    plt.ylabel('Cost', fontsize=14)

    # Setting y-axis values, calculate max once instead of twice to save computation
    max_cost = max(new_dftest_data['Cost']) + 500
    plt.yticks(np.arange(0, max_cost, step=250))

    # Setting x-axis labels
    plt.xticks(range(len(new_dftest_data['Coverage'])), new_dftest_data['Coverage'], rotation=60, ha='right', fontsize=10)

    # Adding text labels to the bars, improving layout handling
    for bar, row in zip(bars, new_dftest_data.itertuples()):
        plt.text(bar.get_x() + bar.get_width() / 2, bar.get_height(), f'${row.Cost:.2f}', ha='center', va='bottom')

    # Use tight layout to handle spacing automatically
    plt.tight_layout()

    # Save the figure with a specified dpi to control quality and file size
    plt.savefig(f'{expectedTotalPremium_directory}/FeaturePredictedValues.png', dpi=100)  # Lower dpi to speed up saving
    plt.close()  # Close the plot to free up memory


