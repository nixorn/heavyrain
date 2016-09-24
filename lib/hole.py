#!/usr/bin/env python
import uuid
import random
from .redis_stuff import (redis_holes,
                          set_redis_value,
                          get_redis_value)

STATE_BUSY = 'busy'
STATE_FREE = 'free'


def new_hole(vertex=None):
    hole = {'uid': uuid.uuid1().hex,
            'vertex': vertex if vertex else random.randint(1, 7),
            'state': STATE_FREE,
            'figure': '',
            'player_to': '',
            'player_from': ''}
    set_redis_value(hole['uid'], hole, redis_holes)
    return hole


def put_figure(hole_uid, figure_uid, player_to_uid, player_from_uid):
    hole = get_redis_value(hole_uid, redis_holes)
    hole['state'] = STATE_BUSY
    hole['figure'] = figure_uid
    hole['player_to'] = player_to_uid
    hole['player_from'] = player_from_uid
    set_redis_value(hole_uid, hole, redis_figures)

def break_put(hole_uid):
    hole = get_redis_value(hole_uid, redis_holes)
    hole['state'] = STATE_FREE
    hole['player_to'] = ''
    hole['player_from'] = ''
    set_redis_value(hole_uid, hole, redis_figures)

    
def check_put_success(hole_uid):
    hole = get_redis_value(hole_uid, redis_holes)
    if hole['state'] == STATE_BUSY:
        return True
    else:
        return False
