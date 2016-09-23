#!/usr/bin/env python
"""Фигура. Фигура имеех Х вершин, ид, и состояние.
Состояние может быть """
import uuid
import random
from .redis_stuff import redis_figures, set_redis_value, get_redis_value


STATES = {'free', 'passing'}


def new_figure(vertex=None):
    figure = {'uid': uuid.uuid1().hex,
              'vertex': vertex if isinstance(vertex, int)\
                               else random.randint(1, 7),
              'state': 'free'}
    set_redis_value(figure['uid'], figure, redis_figures)
    return figure


def increment(fig_uid):
    figure = get_redis_value(fig_uid, redis_figures)
    figure['vertex'] += 1
    set_redis_value(fig_uid, figure, redis_figures)
    return geometry


def decrement(fig_uid):
    figure = get_redis_value(fig_uid, redis_figures)
    figure['vertex'] -= 1
    set_redis_value(fig_uid, figure, redis_figures)
    return geometry


def delete_figure(uid):
    redis_figures.delete(uid)
    print('DELETED FIGURE', uid)
