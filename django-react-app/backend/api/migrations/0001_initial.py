# Generated by Django 4.2.16 on 2024-09-14 19:43

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Members',
            fields=[
                ('memberId', models.IntegerField(primary_key=True, serialize=False)),
                ('memberName', models.CharField(max_length=8, null=True)),
                ('memberYear', models.IntegerField(null=True)),
            ],
            options={
                'db_table': 'Members',
                'managed': False,
            },
        ),
    ]
