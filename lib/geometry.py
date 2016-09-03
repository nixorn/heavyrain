#!/usr/bin/env python
import uuid
import random


def increment(geometry):
    geometry = geometry.copy()
    geometry['vertex'] += 1
    return geometry


def decrement(geometry):
    geometry = geometry.copy()
    geometry['vertex'] -= 1
    return geometry


def new_figure():
    return {'uid': uuid.uuid1().hex,
            'vertex': random.randint(1, 7)}


def new_hole():
    return {'uid': uuid.uuid1().hex,
            'vertex': random.randint(1, 7)}



