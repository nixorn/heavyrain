#!/usr/bin/env python
"""
Плеер это чувак, который тилибонькает фигурки.
Плеер = игровое пространство плеера, в котором бултыхаются фигурки. И бобер.
Плеер связан со стеной, которая связывает его игровое пространство с 
пространством каким-то другим."""
import uuid
from .figure import new_figure, delete_figure
from .hole import new_hole
from .redis_stuff import (redis_players,
                          redis_walls,
                          set_redis_value,
                          get_redis_value)


def new_player(name=None, figures=None, uid=None):
    player = {}
    player['uid'] = uid if uid else uuid.uuid1().hex
    if figures:
        player['figures'] = figures
    if name:
        player['name'] = name
    player['scores'] = 0
    set_redis_value(player['uid'], player, redis_players)
    return player


def destroy_player(uid):
    player = get_redis_value(uid, redis_players)
    for fig in player['figures']:
        delete_figure(fig)
    for wall_key in redis_walls.keys():
        wall = get_redis_value(wall_key, redis_walls)
        if uid in wall['players']:
            wall['players'].remove(uid)
            set_redis_value(wall['uid'], wall, redis_walls)
    redis_players.delete(uid)
    print('DELETED PLAYER', uid)


def move_figure(player_from, player_to, figure):
    pass


def break_moving(figure):
    pass


