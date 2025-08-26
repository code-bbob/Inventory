from django.urls import path
from . import views

urlpatterns = [
    # path('persons/',views.PersonView.as_view(),name='persons')
    path('branch/',views.BranchView.as_view(),name='branch'),
    path('branch/<int:id>/',views.BranchView.as_view(),name='branch'),
    path('getbranch/',views.UserBranchView.as_view(),name='branch'),
    path('staffbranch/<int:id>/',views.BranchStaffView.as_view(),name='branch_staff'),
    path('role/',views.RoleView.as_view(),name='user_role'),
    path('info/',views.EnterpriseInfoView.as_view(),name='enterprise_info'),
   
]