from django.shortcuts import render
from rest_framework.response import Response
from .serializers import PurchaseTransactionSerializer,SalesTransactionSerializer,VendorSerializer,VendorTransactionSerialzier,VendorBrandSerializer
from rest_framework.views import APIView
from rest_framework import status
from .models import PurchaseTransaction,SalesTransaction,Vendor,VendorTransactions,Purchase,Sales
from rest_framework.permissions import IsAuthenticated
from allinventory.models import Product,Brand
from django.utils.dateparse import parse_date
from django.utils import timezone
from datetime import date, datetime
from django.utils.dateparse import parse_date
from rest_framework.pagination import PageNumberPagination


# Create your views here.

class PurchaseTransactionView(APIView):
    
    def post(self, request, format=None):
        user = request.user
        enterprise = user.person.enterprise
        request.data['enterprise'] = enterprise.id
        serializer = PurchaseTransactionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request,pk=None, format=None):
        user = request.user
        enterprise = user.person.enterprise
        search = request.GET.get('search')
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        transactions = PurchaseTransaction.objects.filter(enterprise=enterprise)

        if pk:
            print(pk)
            purchase_transaction = PurchaseTransaction.objects.get(id=pk)
            serializer = PurchaseTransactionSerializer(purchase_transaction)
            return Response(serializer.data)
        
        if search:
            phone_transactions = transactions.filter(purchase__product__name__icontains = search)
            vendor_trasactions = transactions.filter(vendor__name__icontains = search)
            transactions = phone_transactions.union(vendor_trasactions)
        
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

        serializer = PurchaseTransactionSerializer(paginated_transactions, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    def patch(self,request,pk,format=None):
        data = request.data
        data['enterprise'] = request.user.person.enterprise.id
        print(data)
        print(pk)
        try:
            purchase_transaction = PurchaseTransaction.objects.get(id=pk)
        except PurchaseTransaction.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = PurchaseTransactionSerializer(purchase_transaction,data=data,partial=True)
        print("asdmnb",serializer)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)
    
    def delete(self,request,pk,format=None):
        purchase_transaction = PurchaseTransaction.objects.get(id=pk)
        purchases = purchase_transaction.purchase.all()
        for purchase in purchases:
            product = purchase.product
            product.count -= purchase.quantity
            product.stock -= purchase.total_price
            product.save()
            brand = product.brand
            brand.count -= purchase.quantity
            brand.stock -= purchase.total_price
            print(brand.stock)
            brand.save()
        amount = purchase_transaction.total_amount
        vendor = purchase_transaction.vendor
        brand = vendor.brand
        vendor.due -= amount
        vendor.save()
        purchase_transaction.delete()
        return Response("Deleted")

class SalesTransactionView(APIView):
        
        def post(self, request, format=None):
            user = request.user
            enterprise = user.person.enterprise
            request.data['enterprise'] = enterprise.id
            serializer = SalesTransactionSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        def get(self, request,pk=None, format=None):
            user = request.user
            enterprise = user.person.enterprise
            search = request.GET.get('search')
            start_date = request.GET.get('start_date')
            end_date = request.GET.get('end_date')
            transactions = SalesTransaction.objects.filter(enterprise=enterprise)

            if pk:
                sales_transaction = SalesTransaction.objects.get(id=pk)
                serializer = SalesTransactionSerializer(sales_transaction)
                return Response(serializer.data)
            
            if search:
                product_transactions = transactions.filter(sales__product__name__icontains = search)
                customer_transactions = transactions.filter(name__icontains = search)
                phone_transactions = transactions.filter(phone_number__icontains = search)
                transactions = product_transactions.union(customer_transactions,phone_transactions)
            
            if start_date and end_date:
                start_date = parse_date(start_date)
                end_date = parse_date(end_date)

            if start_date and end_date:
                start_date = datetime.combine(start_date, datetime.min.time())
                end_date = datetime.combine(end_date, datetime.max.time())
                
                transactions = SalesTransaction.objects.filter(
                    date__range=(start_date, end_date)
                )

            transactions = transactions.order_by('-id')


            paginator = PageNumberPagination()
            paginator.page_size = 5  # Set the page size here
            paginated_transactions = paginator.paginate_queryset(transactions, request)

            serializer = SalesTransactionSerializer(paginated_transactions, many=True)
            return paginator.get_paginated_response(serializer.data)
        
        def patch(self,request,pk,format=None):
            data = request.data
            data['enterprise'] = request.user.person.enterprise.id

            try:
                sales_transaction = SalesTransaction.objects.get(id=pk)
            except SalesTransaction.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)

            serializer = SalesTransactionSerializer(sales_transaction,data=data,partial=True)
            print("asdmnb",serializer)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors)
        
        def delete(self,request,pk,format=None):
            sales_transaction = SalesTransaction.objects.get(id=pk)
            sales = sales_transaction.sales.all()
            for sale in sales:
                product = sale.product
                product.count += sale.quantity
                product.stock += sale.total_price
                product.save()
                brand = product.brand
                brand.count += sale.quantity
                brand.stock += sale.total_price
                brand.save()
            sales_transaction.delete()
            return Response("Deleted")
        
class VendorView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request,*args, **kwargs):
        id = request.GET.get("id")
        if id:
            vendor = Vendor.objects.get(id=id)
            
        vendors = Vendor.objects.filter(enterprise = request.user.person.enterprise)
        serializer = VendorSerializer(vendors,many=True)
        return Response(serializer.data)
    
    def post(self,request,*args, **kwargs):
        data = request.data
        data["enterprise"] = request.user.person.enterprise.id
        serializer = VendorSerializer(data=data)
        if serializer.is_valid(raise_exception = True):
            serializer.save()
            return Response(serializer.data)
    

class VendorTransactionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request,pk=None):
        if pk:
            vendor_transactions = VendorTransactions.objects.get(id=pk)
            serializer = VendorTransactionSerialzier(vendor_transactions)
            return Response(serializer.data)
        query = request.GET.get('search')
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        vendor_transactions = VendorTransactions.objects.filter(enterprise = request.user.person.enterprise)
        if query:
            vendor_transactions_name = VendorTransactions.objects.filter(vendor__name__icontains=query,enterprise = request.user.person.enterprise)
            vendor_transactions_brand = VendorTransactions.objects.filter(vendor__brand__name__icontains=query,enterprise = request.user.person.enterprise)
            vendor_transactions = vendor_transactions_name.union(vendor_transactions_brand)

        if start_date and end_date:
            start_date = parse_date(start_date)
            end_date = parse_date(end_date)

        if start_date and end_date:
            start_date = datetime.combine(start_date, datetime.min.time())
            end_date = datetime.combine(end_date, datetime.max.time())
            
            vendor_transactions = VendorTransactions.objects.filter(
                date__range=(start_date, end_date)
            )

        vendor_transactions = vendor_transactions.order_by('-date')

        paginator = PageNumberPagination()
        paginator.page_size = 5  # Set the page size here
        paginated_transactions = paginator.paginate_queryset(vendor_transactions, request)

        serializer = VendorTransactionSerialzier(paginated_transactions, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    def post(self,request,*args, **kwargs):
        data = request.data
        data["enterprise"] = request.user.person.enterprise.id
        serializer = VendorTransactionSerialzier(data=data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self,request,pk):
        data = request.data
        data["enterprise"] = request.user.person.enterprise.id
        vendor_transaction = VendorTransactions.objects.get(id=pk)
        serializer = VendorTransactionSerialzier(vendor_transaction,data=data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)
    
    def delete(self,request,pk):
        vendor_transaction = VendorTransactions.objects.get(id=pk)
        amount = vendor_transaction.amount
        vendor = vendor_transaction.vendor
        vendor_transaction.delete()
        vendor.due += amount
        vendor.save()
        return Response("Deleted")
    

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

        print(start_date,end_date)

        enterprise = request.user.person.enterprise
        print("HERE")
    
        allstock = Product.objects.filter(brand__enterprise = enterprise).count()
        allbrands = Brand.objects.filter(enterprise = enterprise).count()

        monthlypurchases = Purchase.objects.filter(purchase_transaction__enterprise = enterprise,purchase_transaction__date__range=(start_date, end_date))
        print(monthlypurchases)
        monthlysales = Sales.objects.filter(sales_transaction__enterprise = enterprise,sales_transaction__date__range=(start_date, end_date))

        dailypurchases = Purchase.objects.filter(purchase_transaction__enterprise = enterprise,purchase_transaction__date = today.date())
        dailysales = Sales.objects.filter(sales_transaction__enterprise = enterprise,sales_transaction__date = today.date())




        ptamt = 0
        dailyptamt = 0

        pts = PurchaseTransaction.objects.filter(enterprise = enterprise,date__range=(start_date, end_date))
        if pts:
            for pt in pts:
                # #print(pt.total_amount)
                ptamt = (pt.total_amount+ptamt) if pt.total_amount else ptamt

        pts = PurchaseTransaction.objects.filter(enterprise = enterprise,date = today.date())
        if pts:
            for pt in pts:
                # #print(pt.total_amount)
                dailyptamt += pt.total_amount

        stamt = 0
        dailystamt = 0
       

        sts = SalesTransaction.objects.filter(enterprise = enterprise,date__range=(start_date, end_date))
        if sts:
            for st in sts:
                stamt = (st.total_amount + stamt) if st.total_amount else stamt
        
        sts = SalesTransaction.objects.filter(enterprise=enterprise,date = today.date())
        if sts:
            for st in sts:
                dailystamt = (st.total_amount + dailystamt) if st.total_amount else dailystamt

        daily_profit = 0
        # for sale in dailysales:
        #     purchase = Purchase.objects.filter(imei_number = sale.imei_number).first()
        #     if purchase:
        #         daily_profit += sale.unit_price - purchase.unit_price
        
        monthly_profit = 0
        # for sale in monthlysales:
        #     purchase = Purchase.objects.filter(imei_number = sale.imei_number).first()
        #     if purchase:
        #         monthly_profit += sale.unit_price - purchase.unit_price
        
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
    
class VendorBrandsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request,*args, **kwargs):
        brands = Brand.objects.filter(enterprise = request.user.person.enterprise)
        serializer = VendorBrandSerializer(brands,many=True)


        return Response(serializer.data)
    
class SingleVendorBrandView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request,pk):
        vendors = Vendor.objects.filter(enterprise = request.user.person.enterprise, brand=pk)
        serializer = VendorSerializer(vendors, many=True)
        return Response(serializer.data)

# views.py

from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.platypus import Table, TableStyle, Paragraph, SimpleDocTemplate
from reportlab.lib.styles import getSampleStyleSheet
import io
from .models import SalesTransaction

def generate_sales_invoice(request, pk):
    # Get the sales transaction object
    transaction = get_object_or_404(SalesTransaction, id=pk)

    # Create a buffer to hold the PDF data
    buffer = io.BytesIO()

    # Create a PDF object and set up the document
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=60, bottomMargin=18)
    elements = []
    styles = getSampleStyleSheet()

    # Add invoice title
    elements.append(Paragraph(f"Invoice #{transaction.bill_no}", styles['Title']))

    # Add customer information
    customer_info = f"""
    <b>Customer Name:</b> {transaction.name}<br/>
    <b>Phone Number:</b> {transaction.phone_number}<br/>
    <b>Date:</b> {transaction.date.strftime('%Y-%m-%d')}<br/>
    <b>Payment Method:</b> {transaction.method.capitalize()}<br/>
    """
    elements.append(Paragraph(customer_info, styles['Normal']))
    elements.append(Paragraph("<br/><br/>", styles['Normal']))

    # Prepare the table data
    table_data = [["Product Name", "Quantity", "Unit Price", "Total Price"]]

    for sale in transaction.sales.all():
        table_data.append([
            sale.product.name,
            sale.quantity,
            f"{sale.unit_price:.2f}",
            f"{sale.total_price:.2f}"
        ])

    # Add total amount row
    table_data.append(["", "", "Total Amount:", f"{transaction.total_amount:.2f}"])

    # Create the table
    table = Table(table_data, colWidths=[3 * inch, inch, inch, inch])

    # Add style to the table
    style = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0d47a1')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (1, 1), (-1, -2), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -2), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('SPAN', (-2, -1), (-1, -1)),
        ('ALIGN', (-1, -1), (-1, -1), 'RIGHT'),
        ('FONTNAME', (-1, -1), (-1, -1), 'Helvetica-Bold'),
    ])
    table.setStyle(style)

    elements.append(table)

    # Build the PDF
    doc.build(elements)

    # Get the PDF value from the buffer
    pdf = buffer.getvalue()
    buffer.close()

    # Return the PDF as a response
    response = HttpResponse(content_type='application/pdf')
    filename = f"Invoice_{transaction.bill_no}.pdf"
    content = f"attachment; filename={filename}"
    response['Content-Disposition'] = content
    response.write(pdf)
    return response
