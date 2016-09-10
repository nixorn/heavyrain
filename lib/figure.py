#!/usr/bin/env python
"""Фигура. Фигура имеех Х вершин, ид, и состояние.
Состояние может быть """
import uuid
import random
from .redis_stuff import redis_figures


def new_figure():
    figure = {'uid': uuid.uuid1().hex,
              'vertex': random.randint(1, 7),
              'state': ''}
    redis_figures.set(figure['uid'], figure)
    return figure

