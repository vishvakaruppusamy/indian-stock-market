# api/views.py
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

class StockDataView(APIView):
    """
    GET /api/stock/?symbol=RELIANCE
    or  GET /api/stock/?symbols=RELIANCE,INFY,TCS
    This proxies requests to iTick, returning JSON to the frontend.
    """

    def get(self, request):
        itick_key = getattr(settings, "ITICK_API_KEY", None)
        if not itick_key:
            return Response({"error": "iTick API key not configured"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # support both 'symbol' (single) and 'symbols' (comma-separated)
        symbol = request.query_params.get("symbol")
        symbols = request.query_params.get("symbols")

        results = {}

        # helper to fetch single symbol from iTick
        def fetch_one(sym):
            url = f"https://api.itick.org/v1/quotes?symbol={sym}&apikey={itick_key}"
            try:
                resp = requests.get(url, timeout=10)
                resp.raise_for_status()
                return resp.json()
            except requests.RequestException as e:
                return {"error": f"Request failed for {sym}: {str(e)}"}

        if symbol:
            data = fetch_one(symbol)
            return Response(data)

        if symbols:
            # split and fetch for each symbol
            syms = [s.strip() for s in symbols.split(",") if s.strip()]
            for s in syms:
                results[s] = fetch_one(s)
            return Response(results)

        return Response({"error": "Provide 'symbol' or 'symbols' query parameter"}, status=status.HTTP_400_BAD_REQUEST)
