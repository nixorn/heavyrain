#!/usr/bin/env python
import uuid
from .hole import new_hole
from .redis_stuff import (redis_walls,
                          set_redis_value,
                          get_redis_value)
from .player import (remove_figure,
                     add_figure,
                     get_player)
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


    holes = [new_hole() for i in range(3)]
    holes = [h['uid'] for h in holes]
    wall = {'uid': uuid.uuid1().hex,
            'players': players,
            'holes': holes}
    set_redis_value(wall['uid'], wall, redis_walls)
    return wall


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


def get_wall_by_hole(hole_uid):
    for k in redis_walls.keys():
        wall = get_redis_value(k, redis_walls)
        if hole_uid in wall['holes']:
            return wall


def get_wall_by_player(player_uid):
    for k in redis_walls.keys():
        wall = get_redis_value(k, redis_walls)
        if player_uid in wall['players']:
            return wall

        
def get_opponent(player_uid):
    """Если есть чувак с другой стороны - отдает чувака полностью
    если нет - None"""
    wall = get_wall_by_player(player_uid)
    if not wall:
        return None
    elif wall and len(wall['players']) == 1:
        return None
    else:
        players = [p for p in wall['players'] if p != player_uid]
        return get_player(players[0])
    return None
