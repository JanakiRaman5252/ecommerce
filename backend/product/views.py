from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import Product, Cart, CartItem
from .serializers import ProductSerializer, CartItemSerializer, SimpleCartSerializer,CartSerializer,OrderSerializer

class ProductAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk=None):
        if pk:
            product = get_object_or_404(Product, pk=pk)
            serializer = ProductSerializer(product)
            return Response(serializer.data)
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

    def post(self, request, pk=None):
        if not hasattr(request.user, "role") or request.user.role != "admin":
            return Response({"detail": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def put(self, request, pk=None):
        if not hasattr(request.user, "role") or request.user.role != "admin":
            return Response({"detail": "Not authorized"}, status=403)
        product = get_object_or_404(Product, pk=pk)
        serializer = ProductSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk=None):
        if not hasattr(request.user, "role") or request.user.role != "admin":
            return Response({"detail": "Not authorized"}, status=403)
        product = get_object_or_404(Product, pk=pk)
        product.delete()
        return Response(status=204)

class CartItemAPIView(APIView):
    def get(self, request):
        cart_code = request.query_params.get("cart_code")
        if not cart_code:
            return Response({"error": "cart_code is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            cart = Cart.objects.get(cart_code=cart_code)
            cart_items = CartItem.objects.filter(cart=cart)
            serializer = CartItemSerializer(cart_items, many=True)
            return Response({"data": serializer.data}, status=status.HTTP_200_OK)
        except Cart.DoesNotExist:
            return Response({"error": "Cart not found"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        try:
            cart_code = request.data.get("cart_code")
            product_id = request.data.get("product_id")
            product_quantity = int(request.data.get("quantity", 1))

            if not cart_code or not product_id:
                return Response({"error": "cart_code and product_id are required"}, status=status.HTTP_400_BAD_REQUEST)

            cart, _ = Cart.objects.get_or_create(cart_code=cart_code)
            product = Product.objects.get(id=product_id)

            if product.inventory < product_quantity:
                return Response({"error": "Not enough stock available"}, status=status.HTTP_400_BAD_REQUEST)

            cartitem, created = CartItem.objects.get_or_create(cart=cart, product=product)
            if not created:
                cartitem.quantity += product_quantity
            else:
                cartitem.quantity = product_quantity
            cartitem.save()

            cart.update_total()

            serializer = CartSerializer(cart)
            return Response(
                {"data": serializer.data, "message": "Cart updated successfully"},
                status=status.HTTP_201_CREATED,
            )

        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    def put(self, request):
        cart_item_id = request.data.get("cart_item_id")
        new_quantity = request.data.get("quantity")

        if not cart_item_id:
            return Response({"error": "cart_item_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        cart_item = get_object_or_404(CartItem, pk=cart_item_id)

        if new_quantity is not None:
            new_quantity = int(new_quantity)
            if cart_item.product.inventory < new_quantity:
                return Response({"error": "Not enough stock available"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = CartItemSerializer(cart_item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"data": serializer.data, "message": "CartItem updated successfully"})
        return Response(serializer.errors, status=400)

    def delete(self, request):
        cart_item_id = request.data.get("cart_item_id")
        if not cart_item_id:
            return Response({"error": "cart_item_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        cart_item = get_object_or_404(CartItem, pk=cart_item_id)
        cart_item.delete()
        return Response({"message": "CartItem removed successfully"}, status=status.HTTP_204_NO_CONTENT)

class ProductInCartAPIView(APIView):
    def get(self, request):
        cart_code = request.query_params.get("cart_code")
        product_id = request.query_params.get("product_id")

        if not cart_code or not product_id:
            return Response({"error": "cart_code and product_id are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            cart = Cart.objects.get(cart_code=cart_code)
            product = Product.objects.get(id=product_id)
            exists = CartItem.objects.filter(cart=cart, product=product).exists()
            return Response({"product_in_cart": exists})
        except Cart.DoesNotExist:
            return Response({"error": "Cart not found"}, status=status.HTTP_404_NOT_FOUND)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)


class CartProductStatus(APIView):
    def get(self, request):
        cart_code = request.query_params.get("cart_code")
        if not cart_code:
            return Response({"data": {"num_of_items": 0}}, status=status.HTTP_200_OK)
        
        try:
            cart = Cart.objects.get(cart_code=cart_code, paid=False)
            serializer = SimpleCartSerializer(cart)
            return Response({"data": serializer.data}, status=status.HTTP_200_OK)
        except Cart.DoesNotExist:
            return Response({"data": {"num_of_items": 0}}, status=status.HTTP_200_OK)
class CheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        cart_code = request.data.get("cart_code")
        if not cart_code:
            return Response({"error": "cart_code is required"}, status=400)

        try:
            cart = Cart.objects.get(cart_code=cart_code, paid=False)

            if cart.user is None:
                cart.user = request.user
                cart.save(update_fields=["user"])
            elif cart.user != request.user:
                return Response({"error": "This cart belongs to another user"}, status=403)

            cart_items = cart.items.select_related("product")
            if not cart_items.exists():
                return Response({"error": "Cart is empty"}, status=400)

            total = cart.update_total()

            with transaction.atomic():
                for item in cart_items:
                    product = item.product
                    if product.inventory < item.quantity:
                        return Response(
                            {"error": f"Not enough stock for {product.name}"},
                            status=400
                        )
                    product.inventory -= item.quantity
                    product.save()

                cart.paid = True
                cart.save(update_fields=["paid", "total"])

            return Response(
                {"message": "Checkout successful", "cart_code": cart_code, "total_amount": total},
                status=200
            )

        except Cart.DoesNotExist:
            return Response({"error": "Cart not found or already paid"}, status=404)
        
class MyOrdersAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        orders = Cart.objects.filter(user=request.user, paid=True).order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response({"orders": serializer.data}, status=status.HTTP_200_OK)