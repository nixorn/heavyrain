#!/usr/bin/env python
"""
Плеер это чувак, который тилибонькает фигурки.
Плеер = игровое пространство плеера, в котором бултыхаются фигурки. И бобер.
Плеер связан со стеной, которая связывает его игровое пространство с 
пространством каким-то другим."""
import uuid
from .figure import new_figure
from .hole import new_hole
from .redis_stuff import redis_players, set_redis_value, get_redis_value


def new_player(name=None, figures=None):
    player = {}
    player['uid'] = uuid.uuid1().hex
    if figures:
        player['figures'] = figures
    if name:
        player['name'] = name
    player['scores'] = 0
    set_redis_value(player['uid'], player, redis_players)
    return player


def move_figure(player_from, player_to, figure):
    pass


def break_moving(figure):
    pass


def destroy_player(uid):
    pass
