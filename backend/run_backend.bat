@echo off
cd "C:\Users\mokes\OneDrive\Documents\GitHub\Happy-Fox\backend\base_app"

echo Running Django migrations...
"C:/Users/mokes/OneDrive/Documents/GitHub/Happy-Fox/.venv/Scripts/python.exe" manage.py migrate

echo Creating test data...
"C:/Users/mokes/OneDrive/Documents/GitHub/Happy-Fox/.venv/Scripts/python.exe" manage.py create_test_data

echo Generating comprehensive sample data...
"C:/Users/mokes/OneDrive/Documents/GitHub/Happy-Fox/.venv/Scripts/python.exe" manage.py generate_sample_data --users 30 --organizations 2 --courses 8

echo Starting Django server...
"C:/Users/mokes/OneDrive/Documents/GitHub/Happy-Fox/.venv/Scripts/python.exe" manage.py runserver
