# urls.py
from django.urls import path
from .views import (
    ProductAPIView,
    CartItemAPIView, ProductInCartAPIView,
    CartProductStatus, CheckoutView,MyOrdersAPIView
)

urlpatterns = [
    # Products
    path("products/", ProductAPIView.as_view(), name="product-list"),
    path("products/<int:pk>/", ProductAPIView.as_view(), name="product-detail"),

    # Cart
    path("cart-items/", CartItemAPIView.as_view(), name="cart-items"),  # GET, POST, PUT, DELETE
    path("cart-items/check/", ProductInCartAPIView.as_view(), name="product-in-cart"),
    path("cart-status/", CartProductStatus.as_view(), name="cart-status"),

    # Checkout
    path("checkout/", CheckoutView.as_view(), name="checkout"),
     path("my-orders/", MyOrdersAPIView.as_view(), name="my-orders"),
]
