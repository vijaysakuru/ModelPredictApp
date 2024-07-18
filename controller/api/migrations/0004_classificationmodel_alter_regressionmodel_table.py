# Generated by Django 4.2.6 on 2024-07-15 20:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_rename_jsondata_regressionmodel'),
    ]

    operations = [
        migrations.CreateModel(
            name='ClassificationModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('data', models.JSONField()),
            ],
            options={
                'db_table': 'classification_model',
            },
        ),
        migrations.AlterModelTable(
            name='regressionmodel',
            table='regression_model',
        ),
    ]
