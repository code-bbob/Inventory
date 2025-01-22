from django.urls import path
from . import views

urlpatterns = [
    path('purchasetransaction/', views.PurchaseTransactionView.as_view(), name='purchase'),
    path('purchasetransaction/<int:pk>/', views.PurchaseTransactionView.as_view(), name='purchase'),
    path('vendor/', views.VendorView.as_view(), name='vendor'),
    path('salestransaction/', views.SalesTransactionView.as_view(), name='sales'),
    path('salestransaction/<int:pk>/', views.SalesTransactionView.as_view(), name='sales'),
    path('vendortransaction/', views.VendorTransactionView.as_view(), name='vendortransactions'),
    path('vendortransaction/<int:pk>/', views.VendorTransactionView.as_view(), name='vendortransactions'),
    path('stats/', views.StatsView.as_view(), name='stat'),
    path('vendorbrand/',views.VendorBrandsView.as_view(), name='vendorbrand'),
    path('vendorbrand/<int:pk>/',views.SingleVendorBrandView.as_view(), name = 'singlevendorbrand'),
    path('invoice/<int:pk>/', views.generate_sales_invoice, name='generate_invoice'),

]