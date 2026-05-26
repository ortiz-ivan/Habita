from rest_framework import serializers
from .models import Habitacion


class HabitacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habitacion
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
