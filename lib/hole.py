#!/usr/bin/env python
import uuid
import random
from .redis_stuff import (redis_holes,
                          redis_figures,
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
    print('TRYING TO BUSY HOLE')
    hole = get_redis_value(hole_uid, redis_holes)
    hole['state'] = STATE_BUSY
    hole['figure'] = figure_uid
    hole['player_to'] = player_to_uid
    hole['player_from'] = player_from_uid
    print(hole)
    set_redis_value(hole_uid, hole, redis_holes)


def break_put(hole_uid):
    hole = get_redis_value(hole_uid, redis_holes)
    hole['state'] = STATE_FREE
    hole['player_to'] = ''
    hole['player_from'] = ''
    set_redis_value(hole_uid, hole, redis_figures)

    
def check_put_success(hole_uid):
    hole = get_redis_value(hole_uid, redis_holes)
    print('CHECKING HOLE STATE', hole)
    if hole['state'] == STATE_BUSY:
        hole['state'] = STATE_FREE
        hole['player_to'] = ''
        hole['player_from'] = ''
        set_redis_value(hole_uid, hole, redis_holes)
        return True
    else:
        return False
