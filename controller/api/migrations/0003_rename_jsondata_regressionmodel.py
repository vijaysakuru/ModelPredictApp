# Generated by Django 4.2.6 on 2024-07-15 20:10

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_alter_jsondata_table'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='JsonData',
            new_name='RegressionModel',
        ),
    ]