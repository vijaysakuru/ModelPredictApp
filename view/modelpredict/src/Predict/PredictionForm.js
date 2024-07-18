import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './PredictionForm.css'; // Ensure this file is correctly linked
import 'react-toastify/dist/ReactToastify.css';
import { ClipLoader } from 'react-spinners';
import { useRef } from 'react';
import { useEffect } from 'react';


function PredictionForm() {
    const [selectedModel, setSelectedModel] = useState('linearRegression');
    const [selectedAction, setSelectedAction] = useState('preTrainedModel');
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [predictionResult, setPredictionResult] = useState(null);
    const navigate = useNavigate(); // Hook for navigation
    const { user } = useAuth();
    const [loading, setLoading] = useState(null);
    const [abortController, setAbortController] = useState(null);
    const [metricsResult, setMetricsResult] = useState(null);
    const fileInputRef = useRef(null);
    const [timer, setTimer] = useState(0);
    const [timerActive, setTimerActive] = useState(false);


    const [images, setImages] = useState({
        modelScore: "",
        r2Score: "",
        featurePredictedValues: ""
    });

    const handleModelChange = (event) => {
        setSelectedModel(event.target.value);
    };

    const handleActionChange = (event) => {
        setSelectedAction(event.target.value);
    }

    useEffect(() => {
        if (loading) {
            setTimerActive(true);
            setTimer(0);
            const interval = setInterval(() => {
                setTimer(prevTimer => prevTimer + 1);
            }, 1000);
            return () => clearInterval(interval);
        }
        if (!loading && timerActive) {
            setTimerActive(false);
        }
    }, [loading]);    
      

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type === 'application/json') {
            setFile(selectedFile);
            setFileName(selectedFile.name);
        } else {
            alert('Please select a JSON file.');
            setFile(null);
            setFileName('');
        }
        event.target.value = '';  // Clear the input after handling the file
    };
    
    const handleSubmit = async (event) => {
        event.preventDefault();
        const controller = new AbortController();  
        setAbortController(controller);  
        setLoading(true);
    
        setPredictionResult(null);  
        setMetricsResult(null);
        setImages({
            modelScore: "",
            r2Score: "",
            featurePredictedValues: ""
        });
    
        const formData = new FormData();
        formData.append('model', selectedModel);
        formData.append('action', selectedAction);
        formData.append('file', file);
    
        if (!file) {
            alert('No file selected. Please select a file to proceed.');
            setLoading(false);
            return;
        }
    
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}predict/`, {
                method: 'POST',
                body: formData,
                signal: controller.signal  
            });
    
            if (response.ok) {
                const result = await response.json();
                setPredictionResult(result);
                setImages({
                    modelScore: `${process.env.REACT_APP_BACKEND_URL}static/ModelScore.png?${new Date().getTime()}`,
                    r2Score: `${process.env.REACT_APP_BACKEND_URL}static/R2_Score.png?${new Date().getTime()}`,
                    featurePredictedValues: `${process.env.REACT_APP_BACKEND_URL}static/FeaturePredictedValues.png?${new Date().getTime()}`
                });
            } else {
                alert('Backend is down, we are working on it!');
                setPredictionResult(null);
                setImages({
                    modelScore: "",
                    r2Score: "",
                    featurePredictedValues: ""
                });
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Fetch aborted');
            } else if (!navigator.onLine) {
                alert('No internet connection. Please check your network settings.');
            } else if (error.message.includes('Failed to fetch')) {
                alert('Backend is down, we are working on it!');
            } else {
                console.error('Fetch error:', error);
                alert('An unexpected error occurred. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    

    const handleProfileClick = async () => {
        // Example of fetching data
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}userProfile/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email }) // Adjust as necessary
        });

        if (response.ok) {
            const profileData = await response.json();
            console.log(profileData)
            navigate('/profile', { state: { profileData } });
        } else {
            console.error('Failed to fetch profile data');
        }
    };

    const handleLogoutClick = () => {
        // Implement logout functionality
        if (window.confirm('Are you sure you want to logout?')) {
            navigate('/login');
        }
    };

    const handleButtonClick = (imageName) => {
        if (imageName === "Score") {
            window.open(images.modelScore, '_blank');
        } else if (imageName === "R2") {
            window.open(images.r2Score, '_blank');
        } else if (imageName === "Feature") {
            window.open(images.featurePredictedValues, '_blank');
        }
    };

    const handleClear = () => {
        if (window.confirm('Are you sure you want to clear all inputs and results?')) {
            if (abortController) {
                abortController.abort();  // Abort the fetch request
                setAbortController(null);  // Reset the controller in the state
            }
            setSelectedAction('preTrainedModel')
            setSelectedModel('linearRegression')
            setLoading(false);  // Stop any loading indicators
            setPredictionResult(null);  // Clear any prediction results
            setMetricsResult(null);
            setImages({
                modelScore: "",
                r2Score: "",
                featurePredictedValues: ""
            });  // Reset images paths
            setFile(null);  // Reset the file input
            setFileName('');  // Clear the file name display
            if (fileInputRef.current) {
                fileInputRef.current.value = '';  // Clear the file input value
            }
        }
    };    

    const handleMetricsClear = () => {
        setMetricsResult(false)
    }

    const handleShowMetrics = () => {
        setMetricsResult(true)
    }
    
    return (
        <div className="prediction-page">
            <div className="container">

                <div className="profile-icon" onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
                    Profile
                </div>

                <div className="logout-icon" onClick={handleLogoutClick} style={{ cursor: 'pointer' }}>
                    Logout
                </div>

                <div className="prediction-row">

                    <div className={`prediction-form-container ${!predictionResult ? 'initial-view' : ''} ${predictionResult && !metricsResult ? 'results-shown' : ''} ${metricsResult ? 'metrics-shown' : ''}`}>
                        <h1>Model Selection</h1>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <div>
                                    <label htmlFor="action-select">Action On Model:</label>
                                    <select id="action-select" value={selectedAction} onChange={handleActionChange}>
                                        <option value="preTrainedModel">(Preferred) Run on Pre-Trained Model</option>
                                        <option value="trainAndTestModel">Train and Test Model</option>
                                    </select>
                                </div>
                                <br></br>
                                <label htmlFor="model-select">Model:</label>
                                <select id="model-select" value={selectedModel} onChange={handleModelChange}>
                                    <option value="linearRegression">Linear Regression</option>
                                    <option value="ridgeRegression">Ridge Regression</option>
                                    <option value="lassoRegression">Lasso Regression</option>
                                    <option value="randomForest">Random Forest</option>
                                    <option value="gradientBoosting">Gradient Boosting</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="file-input">File:</label>
                                <input type="file" id="file-input" onChange={handleFileChange} accept=".json" />
                                {fileName && <div className="file-name">Selected file: {fileName}</div>}
                            </div>
                            <div className="button-spinner-container">
                                <button type="submit" className="predict-button">Predict</button>
                                {loading ? (
                                    <ClipLoader size={36} color={"#123abc"} loading={loading} />
                                ) : (
                                    <div className="spinner-placeholder"></div>
                                )}
                                <div className="timer-display">
                                    {timerActive && <span>{timer} secs</span>}
                                </div>
                            </div>
                            <button type="button" className="clear-button" onClick={handleClear}>Clear</button>
                        </form>
                    </div>

                    {predictionResult && (
                        <div className={`results-container ${!metricsResult ? 'details-initial' : 'details-expanded'}`}>
                            <h1>Prediction Details</h1>
                                {
                                    <div>
                                        {predictionResult.modelType === 'randomForest' ? (
                                            <div className="results-group">
                                                <strong>Model Name:</strong> Random Forest
                                            </div>
                                        ) : predictionResult.modelType === 'linearRegression' ? (
                                            <div className="results-group">
                                                <strong>Model Name:</strong> Linear Regression
                                            </div>
                                        ) : predictionResult.modelType === 'SVM' ? (
                                            <div className="results-group">
                                                <strong>Model Name:</strong> Support Vector Machine (SVM)
                                            </div>
                                        ) : predictionResult.modelType === 'ridgeRegression' ? (
                                            <div className="results-group">
                                                <strong>Model Name:</strong> Ridge Regression
                                            </div>
                                        ) : predictionResult.modelType === 'lassoRegression' ? (
                                            <div className="results-group">
                                                <strong>Model Name:</strong> Lasso Regression
                                            </div>
                                        ) : predictionResult.modelType === 'gradientBoosting' ? (
                                            <div className="results-group">
                                                <strong>Model Name:</strong> Gradient Boosting
                                            </div>
                                        ) : null}
                                        <div className="results-group"><strong>File Name: </strong> {predictionResult.fileName}</div>
                                        <div className="results-group"><strong>Target Independent Variable: </strong> Total Final Premium </div>
                                        <div className="results-group"><strong>Predicted Value of Target Variable: </strong> {predictionResult.expected}</div>
                                        <h2>Metrics</h2>
                                        <ul>
                                            <div className="results-group"><strong>Model Score: </strong> {predictionResult.score}</div>
                                            {/* <div className="results-group"><strong>Mean Squared Error: </strong> {predictionResult.mse}</div> */}
                                            <div className="results-group"><strong>Mean Absolute Error: </strong> {predictionResult.mae}</div>
                                            <div className="results-group"><strong>R2 Score: </strong> {predictionResult.r2_Score}</div>
                                        </ul>
                                        <div className="button-spinner-container">
                                            <button type="submit" className="independent-button" onClick={handleShowMetrics}>Show More</button>
                                            {loading ? (
                                                <ClipLoader size={36} color={"#123abc"} loading={loading} />
                                            ) : (
                                                <div className="spinner-placeholder"></div>
                                            )}
                                        </div>
                                        <button type="button" className="independent-clear-button" onClick={handleMetricsClear}>Clear</button>
                                    </div>
                                    
                                }
                        </div>
                    )}

                    {metricsResult && (
                        <div className="results-container">
                            <h1>Independent Variables</h1>
                                {
                                <div>
                                    <ul>
                                        {/* <div className="results-group"><strong>Total Final Premium: </strong> {predictionResult.independentVariables["Total Final Premium"]}</div> */}
                                        <div className="results-group"><strong>Liability Premium: </strong> {predictionResult.independentVariables["Liability Premium"]}</div>
                                        <div className="results-group"><strong>Dwelling (Extended Rebuilding Cost): </strong> {predictionResult.independentVariables["Dwelling (Extended Rebuilding Cost)"]}</div>
                                        <div className="results-group"><strong>AOP Deductible: </strong> {predictionResult.independentVariables["AOP Deductible"]}</div>
                                        <div className="results-group"><strong>Other Permanent Structures (Extended Rebuilding Cost): </strong> {predictionResult.independentVariables["Other Permanent Structures (Extended Rebuilding Cost)"]}</div>
                                        <div className="results-group"><strong>Contents: </strong> {predictionResult.independentVariables["Contents"]}</div>
                                        <div className="results-group"><strong>Additional Living Expense: </strong> {predictionResult.independentVariables["Additional Living Expense"]}</div>
                                        <div className="results-group"><strong>Medical Payments: </strong> {predictionResult.independentVariables["Medical Payments"]}</div>
                                        <div className="results-group"><strong>Endorsements Premium: </strong> {predictionResult.independentVariables["Endorsements Premium"]}</div>
                                        <div className="results-group"><strong>Debris Removal - Broadened Tree Removal: </strong> {predictionResult.independentVariables["Debris Removal - Broadened Tree Removal"]}</div>
                                        <div className="results-group"><strong>Personal Injury: </strong> {predictionResult.independentVariables["Personal Injury"]}</div>
                                    </ul>
                                </div>
                                    
                                }
                        </div>
                    )}


                </div> 

                {metricsResult &&
                    (
                        <div className="images-container">
                            {/* Conditional rendering for each image if its URL is present */}
                            {images.modelScore && (
                                <div className="image-block">
                                    <div className="image-name">Model Score</div>
                                    <img src={images.modelScore} alt="Score" />
                                    <button onClick={() => handleButtonClick('Score')}>View</button>
                                </div>
                            )}
                            {images.r2Score && (
                                <div className="image-block">
                                    <div className="image-name">R2 Score</div>
                                    <img src={images.r2Score} alt="R2" />
                                    <button onClick={() => handleButtonClick('R2')}>View</button>
                                </div>
                            )}
                            {images.featurePredictedValues && (
                                <div className="image-block">
                                    <div className="image-name">Feature Predictions</div>
                                    <img src={images.featurePredictedValues} alt="Feature" />
                                    <button onClick={() => handleButtonClick('Feature')}>View</button>
                                </div>
                            )}
                        </div>
                    )
                }
            </div>
        </div>
    );
}

export default PredictionForm;
