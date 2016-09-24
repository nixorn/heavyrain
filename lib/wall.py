#!/usr/bin/env python
import uuid
from .hole import new_hole
from .redis_stuff import (redis_walls,
                          set_redis_value,
                          get_redis_value)
from .player import (remove_figure,
                     add_figure)
import json


def new_wall(holes=[], player='', players=[]):
    """Новую стенку тебе, чтобы было обо что бицо.
    """
    if players and\
       len(players) < 2 and\
       player:
        players.append(player)
    elif not players and\
         player:
        players.append(player)


    holes = [new_hole() for i in range(6)]
    holes = [h['uid'] for h in holes]
    wall = {'uid': uuid.uuid1().hex,
            'players': players,
            'holes': holes}
    set_redis_value(wall['uid'], wall, redis_walls)
    return wall


def is_both_players(wall_uid):
    """с обоих ли сторон стены есть по плееру.
    """
    pass


def get_free_wall(player):
    """Получить первую свободную стену.
    Если свободных нет - создать новую и вернуть."""
    print('trying to get free wall')
    for key in redis_walls.keys():
        wall = get_redis_value(key, redis_walls)
        if len(wall['players']) <= 1:
            wall['players'].append(player['uid'])
            set_redis_value(wall['uid'], wall, redis_walls)
            print('got free wall', wall)
            return wall
    print('there are no free walls!')
    return new_wall(player=player['uid'])


def move_figure(player_from_uid, player_to_uid, figure_uid):
    remove_figure(player_from_uid, figure_uid)
    add_figure(player_to_uid, figure_uid)


def get_wall_by_hole(hole_uid):
    for key in redis_walls.keys():
        wall = get_redis_value(key, redis_walls)
        if hole_uid in wall['holes']:
            return wall
        
