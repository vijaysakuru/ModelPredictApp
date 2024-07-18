from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import User
from django.contrib.auth import authenticate, login as auth_login
from .RegressionModel import Predict
from django.db import connection


@csrf_exempt
def register(request):
    try:
        if request.method == 'POST':
            data = json.loads(request.body)
            User.objects.create_user(
                first_name=data['first_name'],
                last_name=data['last_name'],
                phoneNumber=data['phoneNumber'],
                email=data['email'],
                password=data['password']
            )
            return JsonResponse({"message": "User registered successfully"}, status=201)
    except:
        print("An exception occured at Register Method")
        return JsonResponse({'error': 'Cannot Register this User'}, status=404)

@csrf_exempt
def login(request):
    try:
        if request.method == 'POST':
            data = json.loads(request.body)
            user = authenticate(username=data['email'], password=data['password'])
            if user is not None:
                auth_login(request, user)
                return JsonResponse({
                    "message": "Login successful",
                    "is_admin": user.is_superuser  # Or user.is_staff depending on your definition
                }, status=200)
            else:
                return JsonResponse({"error": "Invalid credentials"}, status=400)
    except:
        print("An exception occured at Login Method")
        return JsonResponse({'error': 'Authentication Issue'}, status=404)

@csrf_exempt
def predict(request):
    try:
        if request.method == 'POST':
            model_type = request.POST.get('model')
            action = request.POST.get('action')
            json_file = request.FILES.get('file')

            try:
                with connection.cursor() as cursor:
                    # Load and train model
                    expectedTotalPremium_directory = '/api/modelPredictions/'

                    current, expected, model_score, mae, mse, rmse, json_data, r2_score = Predict(
                                target_file=json_file,
                                expectedTotalPremium_directory=expectedTotalPremium_directory,
                                model_type=model_type,
                                action= action,
                                conn=connection
                            )

                    current = current.replace(",", "")

                    return JsonResponse({
                        "message": "Prediction successful",
                        "current": current,
                        "expected": expected,
                        "score": round(model_score * 100, 2),
                        "modelType": model_type,
                        "fileName": json_file.name,
                        "mae": round(mae, 2),
                        "mse": round(mse, 2),
                        "rmse": round(rmse, 2),
                        "independentVariables": json_data,
                        "r2_Score": round(r2_score, 3)
                    }, status=200)

            except Exception as e:
                return JsonResponse({"error": str(e)}, status=400)

        return JsonResponse({"error": "Method not allowed"}, status=405)
    except:
        print("An exception occured at Predict Method")
        return JsonResponse({'error': 'Cannot Predict for this data'}, status=404)

@csrf_exempt
def userProfile(request):
    try:
        if request.method == 'POST':
            data = json.loads(request.body)
            email = data['email']
            try:
                user = User.objects.get(email=email)
                user_data = {
                    'user_id': user.user_id,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'phoneNumber': user.phoneNumber,
                    'email': user.email,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                    'last_login': user.last_login.strftime('%Y-%m-%d %H:%M:%S') if user.last_login else None
                }
                return JsonResponse(user_data, status=200)
            except User.DoesNotExist:
                return JsonResponse({'error': 'User not found'}, status=404)
    except:
        print("An exception occured at User Profile Method")
        return JsonResponse({'error': 'Users not found'}, status=404)


@csrf_exempt
def admin(request):
    try:
        if not request.user.is_superuser:
            return JsonResponse({'error': 'Unauthorized'}, status=403)

        # Fetch only non-admin users
        users = User.objects.filter(is_superuser=False)
        users_data = [{
            'user_id': user.user_id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
        } for user in users]
        return JsonResponse({'users': users_data}, safe=False)
    except:
        print("An exception occured at Admin Method")
        return JsonResponse({'error': 'Not an Admin'}, status=404)

@csrf_exempt
def delete_user(request, user_id):
    try:
        user = User.objects.get(user_id=user_id)
        user.delete()
        return JsonResponse({'message': 'User deleted successfully'}, status=200)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

@csrf_exempt
def getNonAdminUsers(request):
    try:
        # Fetching all users who are not superusers
        non_admin_users = User.objects.filter(is_superuser=False)

        users_data = [{
            'user_id': str(user.user_id),  # ensure UUID is converted to string
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'is_staff': user.is_staff  # Optional, shows if they are staff but not superusers
        } for user in non_admin_users]

        return JsonResponse({'users': users_data}, safe=False)
    except:
        return JsonResponse({'error': 'Cannot return Non Admin Users'}, status=404)
