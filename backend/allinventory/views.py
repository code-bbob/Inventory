from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from .models import Product,Brand
from enterprise.models import Branch
from .serializers import ProductSerializer,BrandSerializer
from rest_framework.decorators import api_view
from barcode import EAN13
from barcode.writer import SVGWriter
import io
from django.http import FileResponse
from rest_framework.permissions import IsAuthenticated
from alltransactions.models import Sales,Purchase,SalesTransaction,PurchaseTransaction

# Create your views here.

class ProductView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, pk=None,branch=None):
        if pk:
            try:
                product = Product.objects.get(pk=pk)
                serializer = ProductSerializer(product)
                return Response(serializer.data)
            except Product.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)
        search = request.GET.get('search')

        if branch:
            products = Product.objects.filter(enterprise=request.user.person.enterprise,branch=branch)
            serializer = ProductSerializer(products, many=True)
            return Response(serializer.data)
        if search:
            products = Product.objects.filter(enterprise=request.user.person.enterprise,name__icontains=search)
            serializer = ProductSerializer(products, many=True)
            return Response(serializer.data)
        
        products = Product.objects.filter(enterprise=request.user.person.enterprise)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
    
    def post(self, request, format=None):
        data = request.data
        data['enterprise'] = request.user.person.enterprise.id
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)
    
    def patch(self,request,pk,format=None):
        data = request.data
        role = request.user.person.role
        if role != "Admin":
            return Response("Unauthorized")
        data['enterprise'] = request.user.person.enterprise.id
        
        try:
            product = Product.objects.get(id=pk)
        except Product.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = ProductSerializer(product,data=data,partial=True)
        if serializer.is_valid():
            serializer.save()
            old_stock = product.stock if product.stock else 0
            product.stock = product.count * product.selling_price
            product.brand.stock = product.brand.stock - old_stock + product.stock
            product.brand.save()
            product.save()
            return Response(serializer.data)
        return Response(serializer.errors)
    
    def delete(self,request,pk,format=None):
        product = Product.objects.get(id=pk)
        product.delete()
        return Response("Deleted")
    
class BrandView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request,pk=None,branch=None,format=None):
        if pk:
            brand = Brand.objects.get(id=pk)
            products = Product.objects.filter(brand = brand)
            if products:
                serializer = ProductSerializer(products,many=True)
                return Response(serializer.data)
            else:
                return Response([])
        if branch:
            brands = Brand.objects.filter(branch=branch)
            serializer = BrandSerializer(brands,many=True)
            return Response(serializer.data)
        
        # search = request.GET.get('search')
        # if search:
        #     brands = Brand.objects.filter(enterprise=request.user.person.enterprise,branch=request.user.person.branch,name__icontains=search)
        #     serializer = BrandSerializer(brands, many=True)
        #     return Response(serializer.data)
        brands = Brand.objects.filter(enterprise=request.user.person.enterprise)
        serializer = BrandSerializer(brands, many=True)
        return Response(serializer.data)
    
    def post(self, request, format=None):
        data = request.data
        data['enterprise'] = request.user.person.enterprise.id  
        serializer = BrandSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)
    
    def patch(self,request,pk,format=None):
        data = request.data
        role = request.user.person.role
        if role != "Admin":
            return Response("Unauthorized")
        data['enterprise'] = request.user.person.enterprise.id
        
        try:
            brand = Brand.objects.get(id=pk)
        except Brand.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = BrandSerializer(brand,data=data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)
    
    def delete(self,request,pk,format=None):
        role = request.user.person.role
        if role != "Admin":
            return Response("Unauthorized")
        try:
            brand = Brand.objects.get(id=pk)
            brand.delete()
            return Response("Deleted")
        except Brand.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        


@api_view(['GET'])
def generate_barcode(request,pk=None):
    if pk:
        uid = Product.objects.get(id=pk).uid
        # print(uid)

    barcode = EAN13(uid, writer=SVGWriter())
    
    buffer = io.BytesIO()
    barcode.write(buffer)
    buffer.seek(0)

    # print("BARCODE GENERATED")
    return FileResponse(buffer, content_type='image/svg+xml')


class MergeBrandView(APIView):
    def post(self,request,selfbranch,mergebranch,format=None):
        
        branch = Branch.objects.get(id=mergebranch)
        print(branch.name)
        # return Response("Merged")

        for brand in Brand.objects.filter(branch=branch):
            if brand.name in Brand.objects.filter(branch_id=selfbranch).values_list('name',flat=True):
                continue
            Brand.objects.create(name=brand.name,enterprise=brand.enterprise,branch_id=selfbranch)
        return Response("Merged")

class MergeProductBrandView(APIView):
    def post(self,request,selfbranch,mergebranch,brand,format=None):
        print("MERGING PRODUCTS")
        brand = Brand.objects.get(id=brand)
        products = Product.objects.filter(branch_id=mergebranch,brand__name__iexact=brand.name)
        print("THERESASDSAD ",products) 
        for product in Product.objects.filter(branch_id=mergebranch,brand__name__iexact=brand.name):
            print(product)
            if Product.objects.filter(branch_id=selfbranch, brand=brand, name__iexact=product.name).exists():
                print("HERE")
                continue
            p = Product.objects.create(name=product.name,enterprise=product.enterprise,branch_id=selfbranch,cost_price=product.cost_price,selling_price=product.selling_price,brand_id=brand.id,uid = product.uid)
            print("CREATED",p)
            
        return Response("Merged")
    

class ReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request,pk,format=None):
        product = Product.objects.get(id=pk)
        sales = SalesTransaction.objects.filter(product=product)
        sales = sales.order_by('sales_transaction__date')
        purchases = PurchaseTransaction.objects.filter(product=product)
        purchases = purchases.order_by('purchase_transaction__date')
        transactions = sorted(
            list(sales) + list(purchases),
            key=lambda x: x.sales_transaction.date if isinstance(x, SalesTransaction) else x.purchase_transaction.date
        )
        
        return Response(transactions)