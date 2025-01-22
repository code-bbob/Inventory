from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import PurchaseTransaction, Vendor, Purchase, Scheme,PriceProtection
from .serializers import PurchaseTransactionSerializer, VendorSerializer,SalesTransactionSerializer,SalesSerializer,Sales,SalesTransaction,SchemeSerializer,PurchaseSerializer,PurchaseTransactionSerializer, PriceProtectionSerializer, VendorBrandSerializer
from inventory.serializers import BrandSerializer
from rest_framework.permissions import IsAuthenticated
from inventory.models import Item,Brand,Phone
from datetime import date, datetime
from django.utils.dateparse import parse_date
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.db import models
from rest_framework import generics
from django.utils import timezone
from .models import VendorTransaction
from .serializers import VendorTransactionSerializer
from django.db.models import Sum
from django.db.models.functions import ExtractWeekDay


class PurchaseTransactionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        enterprise = user.person.enterprise
        search = request.GET.get('search')
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        transactions = PurchaseTransaction.objects.filter(enterprise=enterprise)
        
        if search:
            phone_transactions = transactions.filter(purchase__phone__name__icontains = search)
            vendor_trasactions = transactions.filter(vendor__name__icontains = search)
            imei_transactions = transactions.filter(purchase__imei_number__icontains = search)
            transactions = phone_transactions.union(vendor_trasactions,imei_transactions)
        
        if start_date and end_date:
            start_date = parse_date(start_date)
            end_date = parse_date(end_date)

        if start_date and end_date:
            start_date = datetime.combine(start_date, datetime.min.time())
            end_date = datetime.combine(end_date, datetime.max.time())
            
            transactions = PurchaseTransaction.objects.filter(
                date__range=(start_date, end_date)
            )

        transactions = transactions.order_by('-date')


        paginator = PageNumberPagination()
        paginator.page_size = 5  # Set the page size here
        paginated_transactions = paginator.paginate_queryset(transactions, request)
        current_page = paginator.page.number if paginated_transactions else None
        total_pages = paginator.page.paginator.num_pages if paginated_transactions else None

        serializer = PurchaseTransactionSerializer(paginated_transactions, many=True)
        return paginator.get_paginated_response(serializer.data)
        
    def post(self, request, *args, **kwargs):
        data = request.data
        data["enterprise"] = request.user.person.enterprise.id
        
        # Only process the date if it's provided, otherwise, it will take the default value from the model.
        if "date" in data:
            date_str = data["date"]
            # Assuming the format is 'YYYY-MM-DD'
            date_object = datetime.strptime(date_str, '%Y-%m-%d').date()
            datetime_with_current_time = datetime.combine(date_object, timezone.now().time())
            data["date"] = datetime_with_current_time.isoformat()
        
        serializer = PurchaseTransactionSerializer(data=data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class PurchaseTransactionChangeView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PurchaseTransaction.objects.all()
    serializer_class = PurchaseTransactionSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Ensure that we're using partial update
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def perform_update(self, serializer):
        serializer.save()


    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        purchase_data = instance.purchase.all()
        phones = []
        for purchase in purchase_data:
            imei = purchase.imei_number
            item = Item.objects.filter(imei_number = imei, phone = purchase.phone).first()
            phones.append(purchase.phone) if purchase.phone not in phones else None
            if item:
                item.delete()
        vendor = instance.vendor
        method= instance.method
        if method == "credit":
            vendor.due = vendor.due - instance.total_amount
            vendor.save()

        brand = vendor.brand
        brand.stock = brand.stock - instance.total_amount
        brand.save()
        self.perform_destroy(instance)
        for phone in phones:
            phone.calculate_quantity()
            # Item.objects.filter(imei_number = new_imei).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def perform_destroy(self, instance):
        # Any custom logic you want before or after deletion can be added here
        # e.g. logging, sending notifications, updating related records, etc.
        instance.delete()
        

    

class SalesTransactionChangeView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SalesTransaction.objects.all()
    serializer_class = SalesTransactionSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Ensure that we're using partial update
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def perform_update(self, serializer):
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        scheme = None
        sales_data = instance.sales.all()
        phones = []
        for sale in sales_data:
            #print("theakhdnsaknd ",sale)
            scheme = Scheme.objects.filter(sales=sale).first()
            pp = PriceProtection.objects.filter(sales=sale).first()
            phones.append(sale.phone) if sale.phone not in phones else None
            #print(scheme)
            imei = sale.imei_number

            item = Item.objects.create(imei_number = imei, phone = sale.phone)
            
            brand = sale.phone.brand
            purchase = Purchase.objects.filter(imei_number = imei, phone = sale.phone).first()
            brand.stock = brand.stock + purchase.unit_price
            brand.save()

            # Item.objects.filter(imei_number = new_imei).delete()

        
        # Perform the deletion
        self.perform_destroy(instance)
        for phone in phones:
            phone.calculate_quantity()
        if scheme:
            scheme.calculate_receivable()
        if pp:
            pp.calculate_receivable()
        #print("LASTTTT")
        
        return Response(status=status.HTTP_204_NO_CONTENT)

    def perform_destroy(self, instance):
        # Any custom logic you want before or after deletion can be added here
        # e.g. logging, sending notifications, updating related records, etc.
        
        instance.delete()
    


class PurchaseView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        enterprise = user.person.enterprise
        purchases = Purchase.objects.filter(purchase_transaction__enterprise=enterprise)
        serializer = PurchaseSerializer(purchases, many=True)
        return Response(serializer.data)
    

class SalesTransactionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        enterprise = user.person.enterprise
        user = request.user
        enterprise = user.person.enterprise
        search = request.GET.get('search')
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')

        transactions = SalesTransaction.objects.filter(enterprise=enterprise)

        if search:
            phone_transactions = transactions.filter(sales__phone__name__icontains = search)
            customer_trasactions = transactions.filter(name__icontains = search)
            imei_transactions = transactions.filter(sales__imei_number__icontains = search)
            transactions = phone_transactions.union(customer_trasactions,imei_transactions)
        
        if start_date and end_date:
            start_date = parse_date(start_date)
            end_date = parse_date(end_date)

        if start_date and end_date:
            start_date = datetime.combine(start_date, datetime.min.time())
            end_date = datetime.combine(end_date, datetime.max.time())
            
            transactions = SalesTransaction.objects.filter(
                date__range=(start_date, end_date)
            )
        
        transactions = transactions.order_by('-date')


        paginator = PageNumberPagination()
        paginator.page_size = 5  # Set the page size here
        paginated_transactions = paginator.paginate_queryset(transactions, request)

        serializer = SalesTransactionSerializer(paginated_transactions, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    def post(self, request, *args, **kwargs):

        data = request.data
        data["enterprise"] = request.user.person.enterprise.id
        
        # Only process the date if it's provided, otherwise, it will take the default value from the model.
        if "date" in data:
            date_str = data["date"]
            # Assuming the format is 'YYYY-MM-DD'
            date_object = datetime.strptime(date_str, '%Y-%m-%d').date()
            datetime_with_current_time = datetime.combine(date_object, timezone.now().time())
            data["date"] = datetime_with_current_time.isoformat()
        
        serializer = SalesTransactionSerializer(data=data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SalesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        enterprise = user.person.enterprise
        sales = Sales.objects.filter(sales_transaction__enterprise=enterprise)
        serializer = SalesSerializer(sales, many=True)
        return Response(serializer.data)

class VendorView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        enterprise = user.person.enterprise
        vendors = Vendor.objects.filter(enterprise=enterprise)
        serializer = VendorSerializer(vendors, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        user = request.user
        enterprise = user.person.enterprise
        data = request.data
        data["enterprise"] = enterprise.id
        serializer = VendorSerializer(data=data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SchemeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request,*args, **kwargs):
        schemes = Scheme.objects.filter(enterprise = request.user.person.enterprise)
        serializer = SchemeSerializer(schemes,many=True)
        return Response(serializer.data)
    
    def post(self,request,*args,**kwargs):
        data = request.data 
        data["enterprise"]= request.user.person.enterprise.id 
        #print(data)
        id = data["phone"]
        brand = Phone.objects.get(id=id).brand
        data["brand"] = brand.id
        #print("HERE IS DATA",data)
        serializer = SchemeSerializer(data=data)
        #print("HERE")
        #print(data)
        if serializer.is_valid(raise_exception=True):
            #print("NOT HERE")
            serializer.save()
            #print("XAINA")
            return Response(serializer.data)
    
    def patch(self,request,pk):
        
        scheme = get_object_or_404(Scheme, pk=pk)
        
        # Pass `partial=True` to allow partial updates
        serializer = SchemeSerializer(scheme, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()  # Save the changes
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SchemePhoneView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request,id):
        user = request.user
        enterprise = user.person.enterprise
        search = request.GET.get('search')
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')

        schemes = Scheme.objects.filter(enterprise=enterprise,brand=id)

        if search:
            schemes_phone = schemes.filter(phone__name__icontains = search)
            schemes_imei = schemes.filter(sales__imei_number__icontains = search)
            schemes = schemes_phone.union(schemes_imei)
        
        if start_date and end_date:
            start_date = parse_date(start_date)
            end_date = parse_date(end_date)

        if start_date and end_date:
            start_date = datetime.combine(start_date, datetime.min.time())
            end_date = datetime.combine(end_date, datetime.max.time())
            
            schemes = Scheme.objects.filter(
                from_date__range=(start_date, end_date)
            )
        
        schemes = schemes.order_by('-from_date')


        # paginator = PageNumberPagination()
        # paginator.page_size = 2  # Set the page size here
        # paginated_transactions = paginator.paginate_queryset(transactions, request)

        serializer = SchemeSerializer(schemes, many=True)
        # return paginator.get_paginated_response(serializer.data)
        return Response(serializer.data)


        

class PriceProtectionView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self,request,*args, **kwargs):
        pps = PriceProtection.objects.filter(enterprise = request.user.person.enterprise)
        serializer = PriceProtectionSerializer(pps,many=True)
        return Response(serializer.data)
    
    
    def patch(self,request,pk):
        
        pps = get_object_or_404(PriceProtection, pk=pk)
        #print(pps)
        
        # Pass `partial=True` to allow partial updates
        serializer = PriceProtectionSerializer(pps, data=request.data, partial=True)

        
        if serializer.is_valid():
            serializer.save()  # Save the changes
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
    def post(self,request,*args, **kwargs):
        data = request.data
        data["enterprise"] = request.user.person.enterprise.id 
        id = data["phone"]
        brand = Phone.objects.get(id=id).brand
        data["brand"] = brand.id
        serializer = PriceProtectionSerializer(data=data)
        if serializer.is_valid(raise_exception = True):
            serializer.save()
            return Response(serializer.data)
        

class StatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request):

        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')

        if not start_date or not end_date:
            today = timezone.now()
            start_date = today.replace(day=1)  # First day of the current month
            end_date = today
        
        start_date = parse_date(start_date) if isinstance(start_date, str) else start_date
        end_date = parse_date(end_date) if isinstance(end_date, str) else end_date

        #print(start_date,end_date)

        enterprise = request.user.person.enterprise
    
        allstock = Item.objects.filter(phone__brand__enterprise = enterprise).count()
        allbrands = Brand.objects.filter(enterprise = enterprise).count()

        monthlypurchases = Purchase.objects.filter(purchase_transaction__enterprise = enterprise,purchase_transaction__date__date__range=(start_date, end_date))
        #print(monthlypurchases)
        monthlysales = Sales.objects.filter(sales_transaction__enterprise = enterprise,sales_transaction__date__date__range=(start_date, end_date))

        dailypurchases = Purchase.objects.filter(purchase_transaction__enterprise = enterprise,purchase_transaction__date__date = today.date())
        dailysales = Sales.objects.filter(sales_transaction__enterprise = enterprise,sales_transaction__date__date = today.date())




        ptamt = 0
        dailyptamt = 0

        pts = PurchaseTransaction.objects.filter(enterprise = enterprise,date__date__range=(start_date, end_date))
        if pts:
            for pt in pts:
                # #print(pt.total_amount)
                ptamt = (pt.total_amount+ptamt) if pt.total_amount else ptamt

        pts = PurchaseTransaction.objects.filter(enterprise = enterprise,date__date = today.date())
        if pts:
            for pt in pts:
                # #print(pt.total_amount)
                dailyptamt += pt.total_amount

        stamt = 0
        dailystamt = 0
       

        sts = SalesTransaction.objects.filter(enterprise = enterprise,date__date__range=(start_date, end_date))
        if sts:
            for st in sts:
                stamt += st.total_amount    
        
        sts = SalesTransaction.objects.filter(enterprise=enterprise,date__date = today.date())
        if sts:
            for st in sts:
                dailystamt += st.total_amount

        daily_profit = 0
        for sale in dailysales:
            purchase = Purchase.objects.filter(imei_number = sale.imei_number).first()
            if purchase:
                daily_profit += sale.unit_price - purchase.unit_price
        
        monthly_profit = 0
        for sale in monthlysales:
            purchase = Purchase.objects.filter(imei_number = sale.imei_number).first()
            if purchase:
                monthly_profit += sale.unit_price - purchase.unit_price
        
        stat = { 
            "enterprise" : enterprise.name,
            "daily":{
                "purchases" : dailypurchases.count(),
                "dailyptamt":dailyptamt,
                "sales": dailysales.count(),
                "dailystamt":dailystamt,
                "profit": round(daily_profit,2)
            },
            "monthly":{
                "purchases" : monthlypurchases.count(),
                "ptamt":ptamt,
                "stamt":stamt,
                "sales": monthlysales.count(),
                "profit": round(monthly_profit,2)
            },
            "stock": allstock,
            "brands" : allbrands
        }
        return Response(stat)
    
class SchemeBrandView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        enterprise = user.person.enterprise

        # Get all brands with schemes under the user's enterprise
        brands_with_schemes = Brand.objects.filter(enterprise=enterprise, scheme_brand__isnull=False).distinct()

        active_result = []
        expired_result = []

        # Loop through each brand
        for brand in brands_with_schemes:
            # Filter active schemes
            active_schemes = Scheme.objects.filter(
                enterprise=enterprise, 
                brand=brand, 
                status = "active"  # Schemes with to_date in the future
            )
            # Filter expired schemes
            expired_schemes = Scheme.objects.filter(
                enterprise=enterprise, 
                brand=brand, 
                status="expired"  # Schemes with to_date in the past
            )

            # Calculate total receivables for active schemes
            active_count = active_schemes.count()
            active_receivables = active_schemes.aggregate(total_receivable=models.Sum('receivable'))['total_receivable'] or 0

            # Calculate total receivables for expired schemes
            expired_count = expired_schemes.count()
            expired_receivables = expired_schemes.aggregate(total_receivable=models.Sum('receivable'))['total_receivable'] or 0

            # Add to active list if there are active schemes
            if active_count > 0:
                active_result.append({
                    "id": brand.id,
                    "brand": brand.name,
                    "count": active_count,
                    "total_receivables": active_receivables
                })

            # Add to expired list if there are expired schemes
            if expired_count > 0:
                expired_result.append({
                    "id": brand.id,
                    "brand": brand.name,
                    "count": expired_count,
                    "total_receivables": expired_receivables
                })

        # Return both active and expired lists
        return Response({
            "active_schemes": active_result,
            "expired_schemes": expired_result
        })
    
class SingleScheme(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request,id):
        scheme = Scheme.objects.filter(id=id).first()
        sales = scheme.sales.all().order_by('-sales_transaction__date')
        list = []
        if sales:
            for sale in sales:
                list.append(sale.imei_number)
        dict = {
            "phone":scheme.phone.name,
            "list":list,
            "receivables":scheme.receivable,
            "status":scheme.status
        }
        return Response(dict)

class SchemeChangeView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Scheme.objects.all()
    serializer_class = SchemeSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Ensure that we're using partial update
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def perform_update(self, serializer):
        serializer.save()


class PriceProtectionChangeView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PriceProtection.objects.all()
    serializer_class = PriceProtectionSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Ensure that we're using partial update
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def perform_update(self, serializer):
        serializer.save()

class PPBrandView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        enterprise = user.person.enterprise

        # Get all brands with schemes under the user's enterprise
        brands_with_pp = Brand.objects.filter(enterprise=enterprise, pp_brand__isnull=False).distinct()

        active_result = []
        expired_result = []

        # Loop through each brand
        for brand in brands_with_pp:
            # Filter active schemes
            active_pps = PriceProtection.objects.filter(
                enterprise=enterprise, 
                brand=brand, 
                status = "active"  # Schemes with to_date in the future
            )
            # Filter expired schemes
            expired_pps = PriceProtection.objects.filter(
                enterprise=enterprise, 
                brand=brand, 
                status="expired"  # Schemes with to_date in the past
            )

            # Calculate total receivables for active schemes
            active_count = active_pps.count()
            active_receivables = active_pps.aggregate(total_receivable=models.Sum('receivable'))['total_receivable'] or 0

            # Calculate total receivables for expired schemes
            expired_count = expired_pps.count()
            expired_receivables = expired_pps.aggregate(total_receivable=models.Sum('receivable'))['total_receivable'] or 0

            # Add to active list if there are active schemes
            if active_count > 0:
                active_result.append({
                    "id": brand.id,
                    "brand": brand.name,
                    "count": active_count,
                    "total_receivables": active_receivables
                })

            # Add to expired list if there are expired schemes
            if expired_count > 0:
                expired_result.append({
                    "id": brand.id,
                    "brand": brand.name,
                    "count": expired_count,
                    "total_receivables": expired_receivables
                })

        # Return both active and expired lists
        return Response({
            "active_pps": active_result,
            "expired_pps": expired_result
        })
    
class SinglePP(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request,id):
        pp = PriceProtection.objects.filter(id=id).first()
        sales = pp.sales.all().order_by('-sales_transaction__date')
        list = []
        if sales:
            for sale in sales:
                list.append(sale.imei_number)
        dict = {
            "phone":pp.phone.name,
            "list":list,
            "receivables":pp.receivable,
            "status":pp.status
        }
        return Response(dict)
    


class PPPhoneView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request,id):
        user = request.user
        enterprise = user.person.enterprise
        search = request.GET.get('search')
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')

        pps = PriceProtection.objects.filter(enterprise=enterprise,brand=id)

        if search:
            pps_phone = pps.filter(phone__name__icontains = search)
            pps_imei = pps.filter(sales__imei_number__icontains = search)
            pps = pps_phone.union(pps_imei)
        
        if start_date and end_date:
            start_date = parse_date(start_date)
            end_date = parse_date(end_date)

        if start_date and end_date:
            start_date = datetime.combine(start_date, datetime.min.time())
            end_date = datetime.combine(end_date, datetime.max.time())
            
            pps = PriceProtection.objects.filter(
                from_date__range=(start_date, end_date)
            )
        
        pps = pps.order_by('-from_date')


        # paginator = PageNumberPagination()
        # paginator.page_size = 2  # Set the page size here
        # paginated_transactions = paginator.paginate_queryset(transactions, request)

        serializer = PriceProtectionSerializer(pps, many=True)
        # return paginator.get_paginated_response(serializer.data)
        return Response(serializer.data)


class VendorBrandsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        # id = request.GET.get("id")
        # if id:
        #     brand = Brand.objects.get(id=id)
        #     phones = Phone.objects.filter(brand = brand)
        #     #print(phones)
        #     if phones:
        #         serializer = PhoneSerializer(phones,many=True)
        #         return Response(serializer.data)
        #     else:
        #         return Response("NONE")
        brands = Brand.objects.filter(enterprise = request.user.person.enterprise)
        serializer = VendorBrandSerializer(brands,many=True)


        return Response(serializer.data)

class SingleVendorBrandView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request,id):
        vendors = Vendor.objects.filter(enterprise = request.user.person.enterprise, brand=id)
        serializer = VendorSerializer(vendors, many=True)
        return Response(serializer.data)


class VendorTransactionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request):
        enterprise = request.user.person.enterprise
        search = request.GET.get('search')
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        transactions = VendorTransaction.objects.filter(enterprise=enterprise)
        #print(transactions)
        
        if search:
            name = transactions.filter(vendor__name__icontains = search)
            amount = transactions.filter(amount__icontains = search)
            transactions = name.union(amount)
        
        if start_date and end_date:
            start_date = parse_date(start_date)
            end_date = parse_date(end_date)

        if start_date and end_date:
            start_date = datetime.combine(start_date, datetime.min.time())
            end_date = datetime.combine(end_date, datetime.max.time())
            
            transactions = VendorTransaction.objects.filter(
                date__range=(start_date, end_date)
            )

        transactions = transactions.order_by('-date')


        paginator = PageNumberPagination()
        paginator.page_size = 5  # Set the page size here
        paginated_transactions = paginator.paginate_queryset(transactions, request)

        serializer = VendorTransactionSerializer(paginated_transactions, many=True)
        return paginator.get_paginated_response(serializer.data)
 
    def post(self,request):
        data = request.data
        user = request.user
        enterprise = user.person.enterprise
        data["enterprise"] = enterprise.id
        if "date" in data:
                    date_str = data["date"]
                    # Assuming the format is 'YYYY-MM-DD'
                    date_object = datetime.strptime(date_str, '%Y-%m-%d').date()
                    datetime_with_current_time = datetime.combine(date_object, timezone.now().time())
                    data["date"] = datetime_with_current_time.isoformat()
        
        serializer = VendorTransactionSerializer(data=data)
        if serializer.is_valid(raise_exception = True):
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self,request,pk):
        data = request.data
        transaction = VendorTransaction.objects.filter(id=pk).first()
        #print(transaction)
        if transaction:
            serializer = VendorTransactionSerializer(transaction,data=data,partial=True)
            if serializer.is_valid(raise_exception = True):
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self,request,pk):
        transaction = VendorTransaction.objects.filter(id=pk).first()
        if transaction:
            transaction.vendor.due = transaction.vendor.due + transaction.amount
            transaction.vendor.save()   
            transaction.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(status=status.HTTP_404_NOT_FOUND)
    

class BarChartView(APIView):
    
    permission_classes = [IsAuthenticated]

    def get(self,request,*args, **kwargs):

        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')

        if not start_date or not end_date:
            today = timezone.now()
            start_date = today.replace(day=1)  # First day of the current month
            end_date = today
        
        start_date = parse_date(start_date) if isinstance(start_date, str) else start_date
        end_date = parse_date(end_date) if isinstance(end_date, str) else end_date

        enterprise = request.user.person.enterprise
        sales = Sales.objects.filter(sales_transaction__enterprise = enterprise,sales_transaction__date__date__range=(start_date, end_date))
        print(sales)
        brands = Brand.objects.filter(enterprise = enterprise)
        count_list = []
        for brand in brands:
            sales_count = sales.filter(phone__brand = brand).count()
            count_list.append({'Brand':brand.name,'Sales':sales_count})
        
        res = {"count":count_list}
        amount_list = []
        for brand in brands:
            sales_amount = sales.filter(phone__brand = brand).aggregate(total=models.Sum('unit_price'))['total'] or 0
            amount_list.append({'Brand':brand.name,'Sales':sales_amount})
        res["amount"] = amount_list

        profit_list = []
        for brand in brands:
            profit_sales = sales.filter(phone__brand = brand)
            profit = 0
            for sale in profit_sales:
                purchase = Purchase.objects.filter(imei_number = sale.imei_number).first()
                if purchase:
                    profit += sale.unit_price - purchase.unit_price
            profit_list.append({'Brand':brand.name,'Sales':round(profit,2)})
        res["profit"] = profit_list


        return Response(res)

from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class LineGraphView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Step 1: Import necessary modules
        from django.db.models import Sum
        from django.utils import timezone

        # Step 2: Calculate the date range for the last 7 days
        today = timezone.now().date()
        start_date = today - timezone.timedelta(days=6)  # Include today and the previous 6 days

        # Step 3: Get the enterprise associated with the current user
        enterprise = request.user.person.enterprise

        # Step 4: Query to get sales data in the date range
        sales = (
            Sales.objects.filter(
                sales_transaction__enterprise=enterprise,
                sales_transaction__date__date__range=[start_date, today]
            )
            .values('sales_transaction__date__date')
            .annotate(total_sales=Sum('unit_price'), count=models.Count('id'))
        )

        # Step 5: Initialize lists for the last 7 days
        count_list = [
            {'day': (today - timezone.timedelta(days=i)).strftime('%A'), 'count': 0}
            for i in range(6, -1, -1)
        ]
        amount_list = [
            {'day': (today - timezone.timedelta(days=i)).strftime('%A'), 'count': 0}
            for i in range(6, -1, -1)
        ]
        profit_list = [
            {'day': (today - timezone.timedelta(days=i)).strftime('%A'), 'count': 0}
            for i in range(6, -1, -1)
        ]

        # Step 6: Create a mapping from day name to index in the list
        day_name_to_index = {entry['day']: idx for idx, entry in enumerate(count_list)}

        # Step 7: Update the lists with actual sales data (count and amount)
        for sale in sales:
            sale_date = sale['sales_transaction__date__date']
            day_name = sale_date.strftime('%A')
            total_sales = sale['total_sales']
            total_count = sale['count']

            # Find the index in the list for this day and update count and amount
            idx = day_name_to_index.get(day_name)
            if idx is not None:
                count_list[idx]['count'] = total_count
                amount_list[idx]['count'] = total_sales

        # Step 8: Calculate profit for each day
        for sale in sales:
            sale_date = sale['sales_transaction__date__date']
            day_name = sale_date.strftime('%A')

            # Find all sales for the specific date
            daily_sales = Sales.objects.filter(
                sales_transaction__enterprise=enterprise,
                sales_transaction__date__date=sale_date
            )

            total_profit = 0
            for daily_sale in daily_sales:
                purchase = Purchase.objects.filter(imei_number=daily_sale.imei_number).first()
                if purchase:
                    total_profit += daily_sale.unit_price - purchase.unit_price

            # Update the corresponding day entry with the profit
            idx = day_name_to_index.get(day_name)
            if idx is not None:
                profit_list[idx]['count'] = round(total_profit, 2)

        # Step 9: Construct the response data
        response_data = {
            "count": count_list,
            "amount": amount_list,
            "profit": profit_list
        }

        # Step 10: Return the response
        return Response(response_data)




# class LineGraphView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request, *args, **kwargs):
#         # Step 1: Import necessary modules
#         from django.db.models import Sum
#         from django.utils import timezone

#         # Step 2: Calculate the date range for the last 7 days
#         today = timezone.now().date()
#         start_date = today - timezone.timedelta(days=6)  # Include today and the previous 6 days

#         # Step 3: Get the enterprise associated with the current user
#         enterprise = request.user.person.enterprise

#         # Step 4: Query to get total sales per day in the date range
#         sales = (
#             Sales.objects.filter(
#                 sales_transaction__enterprise=enterprise,
#                 sales_transaction__date__date__range=[start_date, today]
#             )
#             .values('sales_transaction__date__date')
#             .annotate(total_sales=Sum('unit_price'))
#         )

#         # Step 5: Initialize a list of dictionaries for the last 7 days
#         sales_by_day = [
#             {'day': (today - timezone.timedelta(days=i)).strftime('%A'), 'count': 0}
#             for i in range(6, -1, -1)
#         ]

#         # Step 6: Create a mapping from day name to index in the list
#         day_name_to_index = {entry['day']: idx for idx, entry in enumerate(sales_by_day)}

#         # Step 7: Update the list with actual sales data
#         for sale in sales:
#             sale_date = sale['sales_transaction__date__date']
#             day_name = sale_date.strftime('%A')
#             total_sales = sale['total_sales']

#             # Find the index in the list for this day and update the count
#             idx = day_name_to_index.get(day_name)
#             if idx is not None:
#                 sales_by_day[idx]['count'] = total_sales

#         # Step 8: Return the response with the sales by day
#         return Response(sales_by_day)