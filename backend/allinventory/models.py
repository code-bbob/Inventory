from django.db import models
import random

# Create your models here.

class Brand(models.Model):
    name = models.CharField(max_length=255)
    stock = models.FloatField(null=True,blank=True,default=0)
    count = models.IntegerField(null=True,blank=True,default=0)
    enterprise = models.ForeignKey('enterprise.Enterprise', on_delete=models.CASCADE,related_name='all_brand')
    branch = models.ForeignKey('enterprise.Branch', on_delete=models.CASCADE,related_name='all_brand', null=True, blank=True)
    
    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=255)
    uid = models.CharField(max_length = 12,blank=True) 
    # quantity = models.IntegerField(null=True,blank=True)
    cost_price = models.FloatField(null=True,blank=True, default=0)
    selling_price = models.FloatField(null=True,blank=True, default=0)
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE)
    stock = models.IntegerField(null=True,blank=True,default=0)
    count = models.IntegerField(null=True,blank=True,default=0)
    # vendor = models.ForeignKey('alltransactions.Vendor', on_delete=models.CASCADE,related_name='all_product')
    vendor = models.ManyToManyField('alltransactions.Vendor', related_name='all_product', blank=True)
    enterprise = models.ForeignKey('enterprise.Enterprise', on_delete=models.CASCADE,related_name='all_product')
    branch = models.ForeignKey('enterprise.Branch', on_delete=models.CASCADE,related_name='all_product', null=True, blank=True)
    def __str__(self):
        return self.name    
    
    def save(self,*args, **kwargs):

        if self.pk is None:
            if self.uid is None or self.uid == '':
                self.uid = self.generate_unique_uid()
        super().save(*args, **kwargs)
    

    def generate_unique_uid(self):
            ###print("Generating uid")
            while True:
                uid = ''.join([str(random.randint(0, 9)) for _ in range(12)])
                if uid.startswith('0') or uid.startswith('1'):
                    continue
                if not Product.objects.filter(uid=uid).exists():
                    return uid
