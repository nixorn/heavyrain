#!/usr/bin/env python
import uuid
from .hole import new_hole
from .redis_stuff import redis_walls, set_redis_value, get_redis_value
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

    if not holes:
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


def get_free_wall(player={}, holes=[]):
    """Получить первую свободную стену.
    Если свободных нет - создать новую и вернуть."""
    keys = redis_walls.keys()
    for key in keys:
        wall = get_redis_value(key, redis_walls)
        if wall.get('players') and len(wall['players']) <= 1:
            wall['players'].append(player['uid'])
            set_redis_value(wall['uid'], wall, redis_walls)
            return wall
    return new_wall(player=player['uid'], holes=holes)

