# Generated by Django 4.2.23 on 2025-07-25 05:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('students', '0005_team_created_at_team_updated_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='invitation',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
