#!/usr/bin/env python
"""
Плеер это чувак, который тилибонькает фигурки.
Плеер = игровое пространство плеера, в котором бултыхаются фигурки. И бобер.
Плеер связан со стеной, которая связывает его игровое пространство с 
пространством каким-то другим."""
import uuid
from .figure import new_figure, delete_figure
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
    if not player:
        return
    for fig in player['figures']:
        delete_figure(fig)
    for wall_key in redis_walls.keys():
        wall = get_redis_value(wall_key, redis_walls)
        print('TRYING TO DELETE PLAYERS', wall['players'], uid, uid in wall['players'])
        if uid in wall['players']:
            wall['players'].remove(uid)
            set_redis_value(wall['uid'], wall, redis_walls)
    redis_players.delete(uid)
    print('DELETED PLAYER', uid)


def remove_figure(player_uid, figure_uid):
    print('removing figure', figure_uid,' from player', player_uid)
    player = get_redis_value(player_uid, redis_players)
    print('player figures',  player['figures'])
    player['figures'].remove(figure_uid)
    set_redis_value(player_uid, player, redis_players)
    print('player have this figure after removing', figure_uid in player['figures'])


def add_figure(player_uid, figure_uid):
    player = get_redis_value(player_uid, redis_players)
    player['figures'].append(figure_uid)
    set_redis_value(player_uid, player, redis_players)
