#!/usr/bin/env python
"""Фигура. Фигура имеех Х вершин, ид, и состояние.
Состояние может быть """
import uuid
import random
from .redis_stuff import redis_figures


STATES = {'free', 'passing'}

def new_figure(vertex=None):
    figure = {'uid': uuid.uuid1().hex,
              'vertex': vertex if isinstance(vertex, int)\
                               else random.randint(1, 7),
              'state': 'free'}
    redis_figures.set(figure['uid'], figure)
    return figure

