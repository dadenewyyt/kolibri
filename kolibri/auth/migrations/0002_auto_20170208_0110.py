# -*- coding: utf-8 -*-
# Generated by Django 1.9.7 on 2017-02-08 01:10
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('kolibriauth', '0001_initial_redone'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='facilitydataset',
            name='allow_signups',
        ),
        migrations.AddField(
            model_name='facilitydataset',
            name='learner_can_delete_account',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='facilitydataset',
            name='learner_can_edit_name',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='facilitydataset',
            name='learner_can_edit_password',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='facilitydataset',
            name='learner_can_edit_username',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='facilitydataset',
            name='learner_can_sign_up',
            field=models.BooleanField(default=False),
        ),
    ]
