http://127.0.0.1:8001/api/users/
http://127.0.0.1:8002/api/videos/
http://127.0.0.1:8003/api/analytics/

echo "📦 Applying database migrations for User Service..."
(cd users_service && python manage.py makemigrations users && python manage.py migrate)

echo "📦 Applying database migrations for Video Service..."
(cd video_service && python manage.py makemigrations videos && python manage.py migrate)

echo "📦 Applying database migrations for Analytics Service..."
(cd analytics_service && python manage.py makemigrations analytics && python manage.py migrate)

