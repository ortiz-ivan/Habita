from rest_framework import serializers
from .models import Inquilino


class InquilinoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inquilino
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
