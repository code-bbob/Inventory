from django.db import models
from allinventory.models import Brand
from enterprise.models import Enterprise

# Create your models here.


class Vendor(models.Model):
    name = models.CharField(max_length=20)
    phone_number = models.CharField(max_length=10,null=True,blank=True)
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE)
    due = models.FloatField(null=True,blank=True)
    enterprise = models.ForeignKey(Enterprise, on_delete=models.CASCADE,related_name='all_vendor')

    def __str__(self):
        return self.name
    



class PurchaseTransaction(models.Model):
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE)
    enterprise = models.ForeignKey(Enterprise, on_delete=models.CASCADE,related_name='all_purchase_transaction')
    bill_no = models.CharField(max_length=20)
    total_amount = models.FloatField(null=True,blank=True)
    date = models.DateTimeField()
    method = models.CharField(max_length=20,choices=(('cash','Cash'),('credit','Credit'),('cheque','Cheque')),default='credit')
    def __str__(self):
        return self.vendor.name
    
    def calculate_total_amount(self):
        total = sum(purchase.total_price for purchase in self.purchase.all())
        self.total_amount = total
        self.save()
        return self.total_amount
    
    def save(self, *args, **kwargs):
        if self.pk is None:
            super().save(*args, **kwargs)
        
        # Now the instance is saved, we can safely filter related Items
        #print("Calculating quantity......................")
        self.total_amount = Purchase.objects.filter(purchase_transaction=self).aggregate(models.Sum('total_price'))['total_price__sum']

        # Call save again to update the quantity field
        super().save()
    
class Purchase(models.Model):
    # vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE)
    product = models.ForeignKey('allinventory.Product', on_delete=models.CASCADE)
    quantity = models.IntegerField()
    unit_price = models.FloatField()
    total_price = models.FloatField(blank=True,null=True)
    purchase_transaction = models.ForeignKey(PurchaseTransaction, on_delete=models.CASCADE,related_name='purchase')
    
    def __str__(self):
        return self.product.name
    
    def save(self, *args, **kwargs):
        if self.pk is None:
            super().save(*args, **kwargs)
        
        # Now the instance is saved, we can safely filter related Items
        #print("Calculating quantity......................")
        self.total_price = self.quantity * self.unit_price

        # Call save again to update the quantity field
        super().save()


class SalesTransaction(models.Model):
    enterprise = models.ForeignKey(Enterprise, on_delete=models.CASCADE,related_name='all_sales_transaction')
    name = models.CharField(max_length=20)
    phone_number = models.CharField(max_length=10)
    total_amount = models.FloatField(null=True,blank=True)
    date = models.DateTimeField()
    method = models.CharField(max_length=20,choices=(('cash','Cash'),('credit','Credit'),('cheque','Cheque')),default='credit')
    bill_no = models.CharField(max_length=20)
    def __str__(self):
        return f"Sales Transaction {self.pk} of {self.enterprise.name}"
    
    def calculate_total_amount(self):
        total = sum(sales.total_price for sales in self.sales.all())
        self.total_amount = total
        self.save()
        return self.total_amount
    
    def save(self, *args, **kwargs):
        if self.pk is None:
            super().save(*args, **kwargs)
        
        # Now the instance is saved, we can safely filter related Items
        #print("Calculating quantity......................")
        self.total_amount = Sales.objects.filter(sales_transaction=self).aggregate(models.Sum('total_price'))['total_price__sum']

        # Call save again to update the quantity field
        super().save()
    
class Sales(models.Model):
    product = models.ForeignKey('allinventory.Product', on_delete=models.CASCADE)
    quantity = models.IntegerField()
    unit_price = models.FloatField()
    total_price = models.FloatField(null=True,blank=True)
    sales_transaction = models.ForeignKey(SalesTransaction, on_delete=models.CASCADE,related_name='sales')
    
    def __str__(self):
        return self.product.name
    
    def save(self, *args, **kwargs):
        if self.pk is None:
            super().save(*args, **kwargs)
        
        # Now the instance is saved, we can safely filter related Items
        #print("Calculating quantity......................")
        self.total_price = self.quantity * self.unit_price

        # Call save again to update the quantity field
        super().save()

class VendorTransactions(models.Model):

    date = models.DateTimeField()
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE,related_name='allvendors')
    amount = models.FloatField(null=True,blank=True)
    method = models.CharField(max_length=20,choices=(('cash','Cash'),('credit','Credit'),('cheque','Cheque')),default='cash')
    cheque_number = models.CharField(max_length=10,null=True,blank=True)
    cashout_date = models.DateField(null=True)
    enterprise = models.ForeignKey('enterprise.Enterprise', on_delete=models.CASCADE,related_name='all_vendor_transactions')
    desc = models.CharField(max_length=50)
    purchase_transaction = models.ForeignKey(PurchaseTransaction, on_delete=models.CASCADE,related_name="vendor_transaction",null=True,blank=True)

    
    def __str__(self):
        return f"Vendor Transaction {self.pk} of {self.vendor.name}"
    
