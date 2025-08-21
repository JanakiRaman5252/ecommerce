from django.db import models
from django.conf import settings

class Product(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=5, decimal_places=2, default=0)  
    inventory = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)

    def discounted_price(self):
        """Return price after discount"""
        return self.price - (self.price * (self.discount / 100))

    def __str__(self):
        return self.name


class Cart(models.Model):
    cart_code = models.CharField(max_length=50, unique=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True)
    paid = models.BooleanField(default=False)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)  
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    modified_at = models.DateTimeField(auto_now=True, blank=True, null=True)

    def __str__(self):
        return self.cart_code

    def update_total(self):
        """Recalculate and update total"""
        total = sum(item.product.discounted_price() * item.quantity for item in self.items.all())
        self.total = total
        self.save(update_fields=["total"])
        return total


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f'{self.quantity} × {self.product.name} in Cart {self.cart.id}'

    def save(self, *args, **kwargs):
        """Ensure cart total updates when item changes"""
        super().save(*args, **kwargs)
        self.cart.update_total()

    def delete(self, *args, **kwargs):
        """Ensure cart total updates when item is deleted"""
        super().delete(*args, **kwargs)
        self.cart.update_total()
