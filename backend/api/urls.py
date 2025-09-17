# api/urls.py
from django.urls import path
from .views import StockDataView

urlpatterns = [
    path("stock/", StockDataView.as_view(), name="stock-data"),
]
