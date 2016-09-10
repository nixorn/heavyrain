#!/usr/bin/env python
import uuid
from .hole import new_hole
from .redis_stuff import redis_walls
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
    redis_walls.set(wall['uid'], wall)
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
        wall = redis_walls.get(key).decode('utf-8')
        print('decoded wall', wall)
        print('unjsoned wall', json.load(wall))
        if wall.get('players') and len(wall['players']) <= 1:
            wall['players'].append(player.uid)
            redis_walls.set(wall['uid'], wall)
            return wall
    return new_wall(player=player['uid'], holes=holes)

